import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserPayloadRequest } from '../../user/dto/index';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayloadRequest> {
    const data = { email, password };
    const user = await this.authService.validateUser(data);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
