import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CronWebhook } from './cron-schedule';
import { TokenCrypt } from './utils/crypt-webhook-token';

@Module({
  imports: [HttpModule],
  providers: [
    WebhookService,
    WebhookRepository,
    PrismaService,
    CronWebhook,
    TokenCrypt,
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}
