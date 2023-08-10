import { Module } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationGateway } from './notification.gateway';

@Module({
  providers: [
    NotificationGateway,
    JwtService,
    UserRepository,
    AuthService,
    PrismaService,
  ],
  exports: [NotificationGateway],
})
export class WebsocketModule {}
