import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [NotificationGateway, UserRepository, AuthService, PrismaService],
  exports: [NotificationGateway],
})
export class NotificationModule {}
