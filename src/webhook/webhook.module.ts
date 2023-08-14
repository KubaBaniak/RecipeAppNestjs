import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [WebhookService, UserRepository, PrismaService],
  controllers: [WebhookController],
})
export class WebhookModule {}
