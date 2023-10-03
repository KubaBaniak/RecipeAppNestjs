import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { STRATEGY } from '../constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(STRATEGY.local) {}
