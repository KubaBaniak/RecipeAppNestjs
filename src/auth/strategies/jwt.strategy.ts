import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
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
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
