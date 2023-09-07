import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { JwtPayload } from './payloads/jwt-token.payload';

@Injectable()
export class UserAuthBearerStrategy extends PassportStrategy(
  Strategy,
  'jwt.bearer',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: any): JwtPayload {
    if (payload.status === 'FAILED') {
      throw new ForbiddenException(payload.message);
    }
    return payload;
  }
}
