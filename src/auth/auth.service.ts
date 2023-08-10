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
  SignInRequest,
  SignUpRequest,
  SignUpResponse,
  UserRequest,
} from './dto';
import { UserRepository } from '../user/user.repository';
import { UserPayloadRequest } from '../user/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async verifyJwt(jwtToken: string): Promise<any> {
    return this.jwtService.verifyAsync(jwtToken);
  }

  async signIn(signInRequest: SignInRequest): Promise<string> {
    const user = await this.userRepository.getUserByEmailWithPassword(
      signInRequest.email,
    );
    if (!user) {
      throw new NotFoundException();
    }

    return await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
      },
      { expiresIn: `${process.env.JWT_EXPIRY_TIME}s` },
    );
  }

  async createPAT(userId: number): Promise<string> {
    try {
      return await this.jwtService.signAsync({
        id: userId,
        type: 'PAT',
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
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
}
