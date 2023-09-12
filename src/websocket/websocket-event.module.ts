import { Module } from '@nestjs/common';
import { WebSocketEventGateway } from './websocket-event.gateway';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessTokenRepository } from '../auth/personal-access-token.repository';
import { AccountActivationTimeouts } from '../auth/utils/timeout-functions';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  providers: [
    WebSocketEventGateway,
    UserRepository,
    PersonalAccessTokenRepository,
    AuthService,
    PrismaService,
    SchedulerRegistry,
    AccountActivationTimeouts,
  ],
  exports: [WebSocketEventGateway],
})
export class WebSocketEventModule {}
