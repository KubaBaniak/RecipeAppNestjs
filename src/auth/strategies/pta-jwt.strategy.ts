import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { PtaJwtPayload } from './payloads/pta-jwt-token.payload';

@Injectable()
export class PtaJwtStrategy extends PassportStrategy(Strategy, 'jwt.pta') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: PtaJwtPayload): PtaJwtPayload {
    return payload;
  }
}
