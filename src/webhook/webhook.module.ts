import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CronWebhook } from './cron-schedule-init';

@Module({
  imports: [HttpModule],
  providers: [WebhookService, WebhookRepository, PrismaService, CronWebhook],
  controllers: [WebhookController],
})
export class WebhookModule {}
