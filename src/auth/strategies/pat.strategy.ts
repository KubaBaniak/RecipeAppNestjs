import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { strategyNameConstants } from '../constants';
import { PatJwtPayload } from './payloads/pat-jwt-token.payload';

@Injectable()
export class PersonalAccessTokenStrategy extends PassportStrategy(
  Strategy,
  strategyNameConstants.jwt.pat,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PAT_SECRET,
    });
  }
  validate(payload: PatJwtPayload): PatJwtPayload {
    return payload;
  }
}
