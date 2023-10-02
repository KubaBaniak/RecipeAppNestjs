import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { STRATEGY } from '../constants';

@Injectable()
export class TwoFactorAuthStrategy extends PassportStrategy(
  Strategy,
  STRATEGY.jwt.twoFactor,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_2FA_SECRET,
    });
  }
  validate(payload: { id: number }): { id: number } {
    return { id: payload.id };
  }
}
