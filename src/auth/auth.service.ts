import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { bcryptConstants } from './constants';
import * as bcrypt from 'bcrypt';
import { SignInRequest, SignUpRequest, ValidateUserRequest } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  signIn(signInRequest: SignInRequest): Promise<string> {
    return this.jwtService.signAsync(signInRequest.user);
  }

  async signUp(signUpRequest: SignUpRequest): Promise<User> {
    const user = await this.userService.findOneUser(signUpRequest.email);

    if (!user) {
      const hash = await bcrypt.hash(
        signUpRequest.password,
        bcryptConstants.salt,
      );
      const data = { email: signUpRequest.email, password: hash };
      return await this.userService.createUser(data);
    } else {
      throw new ForbiddenException();
    }
  }

  async validateUser(validateUserRequest: ValidateUserRequest): Promise<User> {
    const user = await this.userService.findOneUser(validateUserRequest.email);

    const isMatch = await bcrypt.compare(
      validateUserRequest.password,
      user?.password,
    );

    if (user && isMatch) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
