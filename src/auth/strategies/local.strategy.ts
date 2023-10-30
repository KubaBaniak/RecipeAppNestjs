import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserPayloadRequest } from '../../user/dto/index';
import { STRATEGY } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY.local) {
  constructor(private authServcie: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserPayloadRequest> {
    const userId = this.authServcie.validateUser({ email, password });
    if (!userId) {
      throw new UnauthorizedException();
    }
    return userId;
  }
}
