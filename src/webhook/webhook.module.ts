import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './webhook.controller';
import { WebhookRepository } from './webhook.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoUtils } from './utils/crypt-webhook-token';
import { WebhookEventsService } from './webhook-events.service';

@Module({
  imports: [HttpModule],
  providers: [
    WebhookService,
    WebhookRepository,
    PrismaService,
    CryptoUtils,
    WebhookEventsService,
  ],
  controllers: [WebhookController],
})
export class WebhookModule {}
