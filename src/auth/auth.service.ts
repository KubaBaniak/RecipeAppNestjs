import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { BCRYPT, NUMBER_OF_2FA_RECOVERY_TOKENS, SERVICE } from './constants';
import * as bcrypt from 'bcryptjs';
import {
  AccessTokenPayload,
  SignInRequest,
  SignUpRequest,
  SignUpResponse,
  UserRequest,
} from './dto';
import { UserRepository } from '../user/user.repository';
import { UserPayloadRequest } from '../user/dto';
import { PersonalAccessTokenRepository } from './personal-access-token.repository';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { TwoFactorAuth } from '@prisma/client';
import { TwoFactorAuthRepository } from './twoFactorAuth.repository';
import { PendingUsersRepository } from '../user/pending-user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly pendingUsersRepository: PendingUsersRepository,
    private readonly userRepository: UserRepository,
    private readonly twoFactorAuthRepository: TwoFactorAuthRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  verifyJwt(jwtToken: string, secret: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(jwtToken, { secret });
  }

  async generateToken(
    id: number,
    secret: string,
    time?: string,
  ): Promise<string> {
    const payload = { id };
    const options: JwtSignOptions = { secret };

    if (time) {
      options.expiresIn = time;
    }

    return this.jwtService.signAsync(payload, options);
  }

  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const [pendingUser, user] = await Promise.all([
      this.pendingUsersRepository.getPendingUserByEmail(signUpRequest.email),
      this.userRepository.getUserByEmail(signUpRequest.email),
    ]);

    if (pendingUser || user) {
      throw new ForbiddenException();
    }

    const hash = await bcrypt.hash(signUpRequest.password, BCRYPT.salt);

    const data = { email: signUpRequest.email, password: hash };

    return this.pendingUsersRepository.createPendingUser(data);
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmail(signInRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.generateToken(
      user.id,
      process.env.JWT_SECRET,
      process.env.JWT_EXPIRY_TIME,
    );
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const validPersonalAccessToken =
      await this.personalAccessTokenRepository.getValidPatForUserId(userId);

    if (validPersonalAccessToken) {
      this.personalAccessTokenRepository.invalidatePatForUserId(userId);
    }
    const personalAccessToken = await this.generateToken(
      userId,
      process.env.JWT_PAT_SECRET,
    );
    const { token } =
      await this.personalAccessTokenRepository.savePersonalAccessToken(
        userId,
        personalAccessToken,
      );
    return token;
  }

  async validateUser(userRequest: UserRequest): Promise<UserPayloadRequest> {
    const user = await this.userRepository.getUserByEmail(userRequest.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(userRequest.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async verifyAccountActivationToken(
    jwtToken: string,
  ): Promise<{ id: number }> {
    try {
      return this.jwtService.verifyAsync(jwtToken, {
        secret: process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
      });
    } catch {
      throw new ForbiddenException('Token expired');
    }
  }

  async activateAccount(userId: number): Promise<UserPayloadRequest> {
    const userData = await this.pendingUsersRepository.getPendingUserById(
      userId,
    );
    const createdUser = this.userRepository.createUser(userData);

    await this.pendingUsersRepository.removePendingUserById(userId);

    return createdUser;
  }

  async changePassword(
    userId: number,
    newPassword: string,
  ): Promise<UserPayloadRequest> {
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT.salt);

    return this.userRepository.updateUserById(userId, {
      password: hashedPassword,
    });
  }

  async generateAccountActivationToken(userId: number): Promise<string> {
    const token = await this.generateToken(
      userId,
      process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
      process.env.ACCOUNT_ACTIVATION_TIME_IN_SECONDS,
    );

    return token;
  }

  async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      return;
    }

    const token = await this.generateToken(
      user.id,
      process.env.JWT_PASSWORD_RESET_SECRET,
      process.env.JWT_PASSWORD_RESET_TIME,
    );
    return token;
  }

  async is2faEnabled(userId: number): Promise<boolean> {
    const isEnabledObject =
      await this.twoFactorAuthRepository.is2faEnabledForUserWithId(userId);

    return isEnabledObject?.isEnabled === true;
  }

  async createQrCodeFor2fa(userId: number): Promise<string> {
    const { email } = await this.userRepository.getUserById(userId);
    const service = SERVICE.name;
    const secretKey = authenticator.generateSecret();

    const otpauth = authenticator.keyuri(email, service, secretKey);

    await this.twoFactorAuthRepository.save2faSecretKeyForUserWithId(
      userId,
      secretKey,
    );

    return qrcode.toDataURL(otpauth);
  }

  async generate2faRecoveryKeys(userId: number): Promise<string[]> {
    const user = await this.userRepository.getUserById(userId);

    const recoveryKeys = Array.from(
      { length: NUMBER_OF_2FA_RECOVERY_TOKENS },
      () => {
        return { key: authenticator.generateSecret() };
      },
    );

    await this.twoFactorAuthRepository.saveRecoveryKeysForUserWithId(
      user.id,
      recoveryKeys,
    );

    return recoveryKeys.map((keyObject) => keyObject.key);
  }

  async enable2fa(userId: number, providedToken: string): Promise<string[]> {
    if (await this.is2faEnabled(userId)) {
      throw new BadRequestException('You have already enabled 2FA');
    }
    const { secretKey } =
      await this.twoFactorAuthRepository.get2faSecretKeyForUserWithId(userId);

    if (authenticator.check(providedToken, secretKey)) {
      return this.generate2faRecoveryKeys(userId);
    } else {
      throw new BadRequestException('Incorrect 2FA token');
    }
  }

  async disable2fa(userId: number): Promise<TwoFactorAuth> {
    if (!(await this.is2faEnabled(userId))) {
      throw new BadRequestException(
        'Could not disable 2FA, because it was not enabled',
      );
    }
    return this.twoFactorAuthRepository.disable2faForUserWithId(userId);
  }

  async verify2fa(userId: number, token: string): Promise<string> {
    const user = await this.userRepository.getUserById(userId);
    const { secretKey } =
      await this.twoFactorAuthRepository.get2faSecretKeyForUserWithId(userId);
    const { recoveryKeys: keys } =
      await this.twoFactorAuthRepository.get2faRecoveryKeysForUserWithId(
        userId,
      );

    if (authenticator.check(token, secretKey)) {
      return this.generateToken(
        user.id,
        process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
        process.env.ACCOUNT_ACTIVATION_TIME_IN_SECONDS,
      );
    }

    if (keys.some(({ key, isUsed }) => key === token && !isUsed)) {
      await this.twoFactorAuthRepository.expire2faRecoveryKey(token);
      return this.generateToken(
        user.id,
        process.env.JWT_SECRET,
        process.env.JWT_EXPIRY_TIME,
      );
    }

    throw new UnauthorizedException('Incorrect 2FA token');
  }

  async regenerate2faRecoveryTokens(userId: number): Promise<string[]> {
    if (!(await this.is2faEnabled(userId))) {
      throw new BadRequestException('You have to enable 2FA first');
    }

    return this.generate2faRecoveryKeys(userId);
  }
}
