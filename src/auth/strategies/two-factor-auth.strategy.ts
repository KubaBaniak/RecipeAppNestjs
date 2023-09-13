import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants, strategyNameConstants } from '../constants';
import { TwoFactorAuthPayload } from './payloads/two-factor-auth.payload';

@Injectable()
export class TwoFactorAuthStrategy extends PassportStrategy(
  Strategy,
  strategyNameConstants.jwt.twoFactor,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: TwoFactorAuthPayload): { id: number } {
    return { id: payload.id };
  }
}
