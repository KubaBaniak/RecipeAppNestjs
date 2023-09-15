import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategyNameConstants } from '../constants';

@Injectable()
export class PasswordResetAuthGuard extends AuthGuard(
  strategyNameConstants.jwt.passwordReset,
) {}
