import { Module } from '@nestjs/common';
import { WebSocketEventGateway } from './websocket-event.gateway';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PendingUsersRepository } from '../user/pending-user.repository';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    WebSocketEventGateway,
    UserRepository,
    PendingUsersRepository,
    PrismaService,
  ],
  exports: [WebSocketEventGateway],
})
export class WebSocketEventModule {}
