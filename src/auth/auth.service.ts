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
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  signIn(user: User): Promise<string> {
    const payload = { email: user.email, password: user.password };
    return this.jwtService.signAsync(payload);
  }

  async signUp(dto: AuthDto): Promise<User> {
    const user = await this.userService.findOneUser(dto.email);

    if (!user) {
      const hash = await bcrypt.hash(dto.password, bcryptConstants.salt);
      const data = { email: dto.email, password: hash };
      return await this.userService.createUser(data);
    } else {
      throw new ForbiddenException();
    }
  }

  async validateUser(dto: AuthDto): Promise<User> {
    const user = await this.userService.findOneUser(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user?.password);

    if (user && isMatch) {
      return user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
