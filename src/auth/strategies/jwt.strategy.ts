import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { jwtConstants, strategyNameConstants } from '../constants';
import { JwtPayload } from './payloads/jwt-token.payload';

@Injectable()
export class UserAuthBearerStrategy extends PassportStrategy(
  Strategy,
  strategyNameConstants.jwt.bearer,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: any): JwtPayload {
    if (payload.status === 'FURTHER_ACTION_IS_REQUIRED') {
      throw new ForbiddenException(payload.message);
    }
    return payload;
  }
}
