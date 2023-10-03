import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { PendingUserRepository } from './pending-user.repository';
import { PendingUserDeletionCronService } from './pending-user-cron';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    PendingUserRepository,
    PrismaService,
    PendingUserDeletionCronService,
  ],
  exports: [UserService, UserRepository, PendingUserRepository],
})
export class UserModule {}
