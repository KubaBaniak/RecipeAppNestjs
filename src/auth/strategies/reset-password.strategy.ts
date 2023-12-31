import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { STRATEGY } from '../constants';

@Injectable()
export class PasswordResetTokenStrategy extends PassportStrategy(
  Strategy,
  STRATEGY.passwordReset,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PASSWORD_RESET_SECRET,
    });
  }
  validate(payload: { id: number }): { id: number } {
    return payload;
  }
}
