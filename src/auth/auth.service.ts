import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { User } from '@prisma/client';
import { AccountActivationTimeouts } from './utils/timeout-functions';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly personalAccessTokenRepository: PersonalAccessTokenRepository,
    private readonly jwtService: JwtService,
    private readonly accountActivationTimeouts: AccountActivationTimeouts,
  ) {}

  async verifyJwt(jwtToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(jwtToken);
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmailWithPassword(
      signInRequest.email,
    );
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      { expiresIn: `${process.env.JWT_EXPIRY_TIME}s` },
    );
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

  async generateAccountActivationToken(userId: number): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        id: userId,
      },
      { expiresIn: `${+process.env.ACCOUNT_ACTIVATION_TIME}s` },
    );

    await this.userRepository.saveAccountActivationToken(userId, token);

    const milliseconds = +process.env.ACCOUNT_ACTIVATION_TIME * 1000;
    const timeoutName = this.accountActivationTimeouts.getName(userId);

    this.accountActivationTimeouts.setTimeout(
      userId,
      milliseconds,
      timeoutName,
    );

    return token;
  }

  async verifyAccountActivationToken(
    jwtToken: string,
  ): Promise<{ id: number }> {
    try {
      return this.jwtService.verifyAsync(jwtToken);
    } catch {
      throw new ForbiddenException('Token expired');
    }
  }

  async activateAccount(userId: number): Promise<User> {
    const timeoutName = this.accountActivationTimeouts.getName(userId);
    try {
      this.accountActivationTimeouts.deleteTimeout(timeoutName);
    } catch {
      throw new NotFoundException(
        `Account deletion timeout has been already deleted, therefore your accound is already activated.`,
      );
    }
    return this.userRepository.activateAccount(userId);
  }
}
