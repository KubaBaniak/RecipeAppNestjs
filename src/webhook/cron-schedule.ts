import { Injectable } from '@nestjs/common';
import cron from 'node-cron';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { retryPolicy } from './utils/retry-policy';
import { TokenCrypt } from './utils/crypt-webhook-token';

@Injectable()
export class CronWebhook {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookRepository: WebhookRepository,
    private readonly tokenCrypt: TokenCrypt,
  ) {
    const maxAttempt = Math.max(...Object.keys(retryPolicy).map((x) => +x));
    cron.schedule('* * * * *', async () => {
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

        if (webhookEvent.attempt === 0) {
          success = this.webhookService.sendWebhookEvent(
            url,
            webhookEvent.data,
            decryptedToken,
          );
        } else if (currentTime >= nextTry) {
          success = this.webhookService.sendWebhookEvent(
            url,
            webhookEvent.data,
            decryptedToken,
          );
        }

        await this.webhookRepository.updateAttemptAndSentAt(
          webhookEvent.id,
          webhookEvent.attempt,
        );

        if (success) {
          console.log('success');
          await this.webhookRepository.updateWebhookEventStatus(
            webhookEvent.id,
            'Success',
          );
        }

        if (webhookEvent.attempt > maxAttempt) {
          await this.webhookRepository.updateWebhookEventStatus(
            webhookEvent.id,
            'Failed',
          );
        }
      });
    });
  }
}
