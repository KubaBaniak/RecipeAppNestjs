import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(STRATEGY.bearer) {}
