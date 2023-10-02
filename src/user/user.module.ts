import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { PendingUserDeletion } from './pending-user-cron';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, PrismaService, PendingUserDeletion],
  exports: [UserService, UserRepository],
})
export class UserModule {}
