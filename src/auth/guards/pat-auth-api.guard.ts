import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY } from '../constants';

@Injectable()
export class ApiAuthGuard extends AuthGuard([
  STRATEGY.jwt.pat,
  STRATEGY.jwt.bearer,
]) {}
