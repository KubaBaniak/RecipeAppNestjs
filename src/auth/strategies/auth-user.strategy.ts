import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { STRATEGY } from '../constants';
import { JwtPayload } from './payloads/jwt-token.payload';

@Injectable()
export class UserAuthBearerStrategy extends PassportStrategy(
  Strategy,
  STRATEGY.bearer,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return payload;
  }
}
