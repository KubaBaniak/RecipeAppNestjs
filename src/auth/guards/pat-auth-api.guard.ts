import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategyNameConstants } from '../constants';

@Injectable()
export class ApiAuthGuard extends AuthGuard([
  strategyNameConstants.jwt.pat,
  strategyNameConstants.jwt.bearer,
]) {}
