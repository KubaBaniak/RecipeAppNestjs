import { Module } from '@nestjs/common';
import { WebSocketEventGateway } from './websocket-event.gateway';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    WebSocketEventGateway,
    UserRepository,
    AuthService,
    PrismaService,
  ],
  exports: [WebSocketEventGateway],
})
export class WebSocketEventModule {}
