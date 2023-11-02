import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { STRATEGY } from '../constants';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, STRATEGY.local) {
  constructor(private authServcie: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<number> {
    const userId = await this.authServcie.validateUser({ email, password });

    return userId;
  }
}
