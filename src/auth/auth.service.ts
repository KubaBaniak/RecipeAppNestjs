import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { bcryptConstants } from './constants';
import * as bcrypt from 'bcrypt';
import { SignInRequest, SignUpRequest, UserRequest } from './dto';
import { UserRepository } from '../user/user.repository';
import { UserDto } from '../user/dto/user-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  signIn(signInRequest: SignInRequest): Promise<string> {
    return this.jwtService.signAsync(signInRequest);
  }

  async signUp(signUpRequest: SignUpRequest): Promise<UserDto> {
    const user = await this.userRepository.getUserWithPassword({
      email: signUpRequest.email,
    });

    if (user) {
      throw new ForbiddenException();
    }

    const hash = await bcrypt.hash(
      signUpRequest.password,
      bcryptConstants.salt,
    );

    const data = { email: signUpRequest.email, password: hash };

    return this.userService.createUser(data);
  }

  async validateUser(userRequest: UserRequest): Promise<User> {
    const user = await this.userRepository.getUserWithPassword({
      email: userRequest.email,
    });

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
