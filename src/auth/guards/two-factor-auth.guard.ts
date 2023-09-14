import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategyNameConstants } from '../constants';

@Injectable()
export class TwoFactorAuthGuard extends AuthGuard(
  strategyNameConstants.jwt.twoFactor,
) {}
