import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bcryptConstants, serviceConstants } from './constants';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async verifyJwt(jwtToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(jwtToken);
  }

  async generateBearerToken(id: number, email: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        id,
        email,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: `${process.env.JWT_EXPIRY_TIME}s`,
      },
    );
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmail(signInRequest.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.twoFactorAuth) {
      return this.jwtService.signAsync(
        {
          id: user.id,
        },
        {
          secret: process.env.JWT_2FA_SECRET,
          expiresIn: `${process.env.JWT_2FA_EXPIRY_TIME}s`,
        },
      );
    }

    return this.generateBearerToken(user.id, user.email);
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const validPersonalAccessToken =
      await this.personalAccessTokenRepository.getValidPatForUserId(userId);

    if (validPersonalAccessToken) {
      this.personalAccessTokenRepository.invalidatePatForUserId(userId);
    }
    const personalAccessToken = await this.jwtService.signAsync(
      {
        id: userId,
        type: 'PAT',
      },
      { secret: process.env.JWT_PAT_SECRET },
    );
    const { token } =
      await this.personalAccessTokenRepository.savePersonalAccessToken(
        userId,
        personalAccessToken,
      );
    return token;
  }

  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.userRepository.getUserByEmail(signUpRequest.email);

    if (user) {
      throw new ForbiddenException();
    }

    const hash = await bcrypt.hash(
      signUpRequest.password,
      bcryptConstants.salt,
    );

    const data = { email: signUpRequest.email, password: hash };

    return this.userRepository.createUser(data);
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

  async changePassword(
    userId: number,
    newPassword: string,
  ): Promise<UserPayloadRequest> {
    const hashedPassword = await bcrypt.hash(newPassword, bcryptConstants.salt);

    return this.userRepository.updateUserById(userId, {
      password: hashedPassword,
    });
  }

  async checkIf2faIsEnabledForUserWithId(
    userId: number,
    errorMessage: string,
  ): Promise<void> {
    const { isEnabled } = await this.userRepository.is2faEnabledForUserWithId(
      userId,
    );

    if (!isEnabled) {
      throw new BadRequestException(errorMessage);
    }
  }

  async createQrcodeFor2FA(userId: number): Promise<string> {
    const { email } = await this.userRepository.getUserById(userId);
    const service = serviceConstants.name;
    const secretKey = authenticator.generateSecret();

    const otpauth = authenticator.keyuri(email, service, secretKey);

    await this.userRepository.save2faSecretKeyForUserWithId(userId, secretKey);

    return qrcode.toDataURL(otpauth);
  }

  async generate2faRecoveryKeys(userId: number): Promise<string[]> {
    const user = await this.userRepository.getUserById(userId);

    this.checkIf2faIsEnabledForUserWithId(
      userId,
      'You have to enable or verify 2FA first',
    );

    const recoveryKeys = Array.from({ length: 8 }, () => {
      return { key: authenticator.generateSecret() };
    });

    await this.userRepository.saveRecoveryKeysForUserWithId(
      user.id,
      recoveryKeys,
    );

    return recoveryKeys.map((keyObject) => keyObject.key);
  }

  async enable2fa(userId: number, providedToken: string): Promise<string[]> {
    this.checkIf2faIsEnabledForUserWithId(
      userId,
      'You have already enabled 2FA',
    );

    const { secretKey } =
      await this.userRepository.get2faSecretKeyForUserWithId(userId);

    if (authenticator.check(providedToken, secretKey)) {
      return this.generate2faRecoveryKeys(userId);
    } else {
      throw new BadRequestException('Incorrect 2FA token');
    }
  }

  async disable2FA(userId: number): Promise<TwoFactorAuth> {
    this.checkIf2faIsEnabledForUserWithId(
      userId,
      'Could not disable 2FA, because it was not enabled',
    );
    return this.userRepository.disable2faForUserWithId(userId);
  }

  async verify2FA(userId: number, token: string): Promise<string> {
    const user = await this.userRepository.getUserById(userId);
    const { secretKey } =
      await this.userRepository.get2faSecretKeyForUserWithId(userId);
    const { recoveryKeys: keys } =
      await this.userRepository.get2faRecoveryKeysByUserId(userId);

    if (authenticator.check(token, secretKey)) {
      return this.generateBearerToken(user.id, user.email);
    }

    if (keys.some(({ key, isUsed }) => key === token && !isUsed)) {
      await this.userRepository.expire2faRecoveryKey(token);
      return this.generateBearerToken(user.id, user.email);
    }

    throw new UnauthorizedException('Incorrect 2FA token');
  }
}
