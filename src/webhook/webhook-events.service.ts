import { Injectable } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { retryPolicy } from './utils/retry-policy';
import { TokenCrypt } from './utils/crypt-webhook-token';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WebhookEvent } from '@prisma/client';

@Injectable()
export class WebhookEventsService {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookRepository: WebhookRepository,
    private readonly tokenCrypt: TokenCrypt,
  ) {}

  private maxAttempt = Math.max(...Object.keys(retryPolicy).map((x) => +x));

  @Cron(CronExpression.EVERY_5_SECONDS, {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  async triggerkWebhookEvents() {
    const currentTime = new Date().getTime();
    const webhookEvents =
      await this.webhookRepository.getAllValidWebhookEvents();

    webhookEvents.forEach(async (webhookEvent) => {
      let success: boolean;
      const { url, token, initVector, authTag } =
        await this.webhookRepository.getDataToSendWebhookEvent(
          webhookEvent.webhookId,
        );

      const decryptedToken = token
        ? this.tokenCrypt.decryptToken(token, initVector, authTag)
        : '';

      const lastTry = webhookEvent.sentAt ? webhookEvent.sentAt.getTime() : 0;
      const nextTry = lastTry + retryPolicy[webhookEvent.attempt];

      if (webhookEvent.attempt === 0 || currentTime >= nextTry) {
        success = await this.webhookService.sendWebhookEvent(
          url,
          webhookEvent.data,
          decryptedToken,
        );
        await this.webhookRepository.updateAttemptAndSentAt(
          webhookEvent.id,
          webhookEvent.attempt,
        );

        await this.updateWebhookEventStatus(success, webhookEvent);
      }
    });
  }

  async updateWebhookEventStatus(
    success: boolean,
    webhookEvent: WebhookEvent,
  ): Promise<WebhookEvent> {
    if (success) {
      return this.webhookRepository.updateWebhookEventStatus(
        webhookEvent.id,
        'Success',
      );
    } else if (webhookEvent.attempt > this.maxAttempt) {
      return this.webhookRepository.updateWebhookEventStatus(
        webhookEvent.id,
        'Failed',
      );
    }
  }
}
