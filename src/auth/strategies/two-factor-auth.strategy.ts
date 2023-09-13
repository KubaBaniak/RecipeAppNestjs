import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { strategyNameConstants } from '../constants';
import { TwoFactorAuthPayload } from './payloads/two-factor-auth.payload';

@Injectable()
export class TwoFactorAuthStrategy extends PassportStrategy(
  Strategy,
  strategyNameConstants.jwt.twoFactor,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_2FA_SECRET,
    });
  }
  validate(payload: TwoFactorAuthPayload): { id: number } {
    return { id: payload.id };
  }
}
