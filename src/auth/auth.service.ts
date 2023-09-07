import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { bcryptConstants } from './constants';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly jwtService: JwtService,
  ) { }

  async verifyJwt(jwtToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(jwtToken);
  }

  async successfullLoginToken(id: number, email: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        id,
        email,
      },
      { expiresIn: `${process.env.JWT_EXPIRY_TIME}s` },
    );
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmailWithPassword(
      signInRequest.email,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.enabled2FA) {
      return this.jwtService.signAsync(
        {
          id: user.id,
          status: 'FAILED',
          message:
            'Go to http://localhost:3000/auth/verify-2fa to continue authentication',
        },
        { expiresIn: `30000s` },
      );
    }

    return this.successfullLoginToken(user.id, user.email);
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const validPersonalAccessToken =
      await this.personalAccessTokenRepository.getValidPatForUserId(userId);

    if (validPersonalAccessToken) {
      this.personalAccessTokenRepository.invalidatePatForUserId(userId);
    }
    const personalAccessToken = await this.jwtService.signAsync({
      id: userId,
      type: 'PAT',
    });
    const { token } =
      await this.personalAccessTokenRepository.savePersonalAccessToken(
        userId,
        personalAccessToken,
      );
    return token;
  }

  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.userRepository.getUserByEmailWithPassword(
      signUpRequest.email,
    );

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
    const user = await this.userRepository.getUserByEmailWithPassword(
      userRequest.email,
    );

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

  async enable2FA(
    userId: number,
  ): Promise<{ recoveryKeys: string[]; qrcodeUrl: string }> {
    const secret = process.env.SECRET_KEY_2FA;
    const recoveryKeys: string[] = Array.from({ length: 3 }, () =>
      authenticator.generateSecret(),
    );

    const user = (await this.userRepository.getUserById(userId)).email;
    const service = 'Recipe App';

    const otpauth = authenticator.keyuri(user, service, secret);

    const qrcodeUrl = await qrcode.toDataURL(otpauth);
    this.userRepository.enable2FAForUserWithId(userId, recoveryKeys);
    return { recoveryKeys, qrcodeUrl };
  }

  async verify2FA(userId: number, token: string): Promise<string> {
    const user = await this.userRepository.getUserById(userId);
    const secret = process.env.SECRET_KEY_2FA;

    if (authenticator.check(token, secret)) {
      return this.successfullLoginToken(user.id, user.email);
    } else {
      throw new UnauthorizedException('Incorrect 2FA token');
    }
  }
}
