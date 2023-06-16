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
import { SignInRequest, SignUpRequest, UserRequest } from './dto';

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

    if (user) throw new ForbiddenException();

    const hash = await bcrypt.hash(
      signUpRequest.password,
      bcryptConstants.salt,
    );

    const data = { email: signUpRequest.email, password: hash };

    return this.userService.createUser(data);
  }

  async validateUser(UserRequest: UserRequest): Promise<User> {
    const user = await this.userService.findOneUser(UserRequest.email);

    const isMatch = await bcrypt.compare(UserRequest.password, user?.password);

    if (!user || !isMatch) throw new UnauthorizedException();

    return user;
  }
}
