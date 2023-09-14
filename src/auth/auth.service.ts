import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  verifyJwt(jwtToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(jwtToken);
  }

  async generateBearerToken(
    id: number,
    secret: string,
    timeInSeconds?: number,
  ): Promise<string> {
    const payload = { id };
    const options: JwtSignOptions = { secret };

    if (timeInSeconds) {
      options.expiresIn = `${timeInSeconds}s`;
    }

    return this.jwtService.signAsync(payload, options);
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmailWithPassword(
      signInRequest.email,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.generateBearerToken(
      user.id,
      process.env.JWT_SECRET,
      +process.env.JWT_EXPIRY_TIME,
    );
  }

  async createPersonalAccessToken(userId: number): Promise<string> {
    const validPersonalAccessToken =
      await this.personalAccessTokenRepository.getValidPatForUserId(userId);

    if (validPersonalAccessToken) {
      this.personalAccessTokenRepository.invalidatePatForUserId(userId);
    }
    const personalAccessToken = await this.generateBearerToken(
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

  async signUp(signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const user = await this.userRepository.getPendingUserByEmailWithPassword(
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

    return this.userRepository.createPendingUser(data);
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

  async generateAccountActivationToken(userId: number): Promise<string> {
    const token = await this.generateBearerToken(
      userId,
      process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
      +process.env.ACCOUNT_ACTIVATION_TIME,
    );
    await this.userRepository.saveAccountActivationToken(userId, token);

    return token;
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
    const userData = await this.userRepository.getPendingUserById(userId);

    await this.userRepository.removePendingUserById(userId);

    return this.userRepository.createUser(userData);
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
}
