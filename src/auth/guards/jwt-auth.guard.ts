import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategyNameConstants } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(strategyNameConstants.jwt.bearer) {}
