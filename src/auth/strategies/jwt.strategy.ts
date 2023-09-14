import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { strategyNameConstants } from '../constants';
import { JwtPayload } from './payloads/jwt-token.payload';

@Injectable()
export class UserAuthBearerStrategy extends PassportStrategy(
  Strategy,
  strategyNameConstants.jwt.bearer,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
