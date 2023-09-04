import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { PatJwtPayload } from './payloads/pat-jwt-token.payload';

@Injectable()
export class PersonalAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt.pat',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  validate(payload: PatJwtPayload): PatJwtPayload {
    return payload;
  }
}
