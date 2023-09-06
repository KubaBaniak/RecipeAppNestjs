import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { JwtPayload } from './payloads/jwt-token.payload';
import { UserRepository } from '../../user/user.repository';

@Injectable()
export class UserAuthBearerStrategy extends PassportStrategy(
  Strategy,
  'jwt.bearer',
) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.secret,
    });
  }
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userRepository.getUserById(payload.id);
    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.activated) {
      throw new UnauthorizedException('Activate your account');
    }

    return payload;
  }
}
