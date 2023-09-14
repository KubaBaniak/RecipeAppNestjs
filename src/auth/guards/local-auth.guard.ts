import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { strategyNameConstants } from '../constants';

@Injectable()
export class LocalAuthGuard extends AuthGuard(strategyNameConstants.local) {}
