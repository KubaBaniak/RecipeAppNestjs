import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [WebhookService, WebhookRepository, PrismaService],
  controllers: [WebhookController],
})
export class WebhookModule {}
