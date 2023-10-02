import { Module } from '@nestjs/common';
import { WebSocketEventGateway } from './websocket-event.gateway';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessTokenRepository } from '../auth/personal-access-token.repository';
import { TwoFactorAuthRepository } from '../auth/twoFactorAuth.repository';

@Module({
  providers: [
    WebSocketEventGateway,
    UserRepository,
    TwoFactorAuthRepository,
    PersonalAccessTokenRepository,
    AuthService,
    PrismaService,
  ],
  exports: [WebSocketEventGateway],
})
export class WebSocketEventModule {}
