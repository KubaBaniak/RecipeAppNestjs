import { Injectable } from '@nestjs/common';
import cron from 'node-cron';
import { WebhookService } from './webhook.service';
import { WebhookRepository } from './webhook.repository';
import { retryPolicy } from './utils/retry-policy';
import Cryptr from 'cryptr';

@Injectable()
export class CronWebhook {
  cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);
  constructor(
    private readonly webhookService: WebhookService,
    private readonly webhookRepository: WebhookRepository,
  ) {
    const maxAttempt = Math.max(...Object.keys(retryPolicy).map((x) => +x));
    cron.schedule('* * * * *', async () => {
      const webhookEvents =
        await this.webhookRepository.getAllValidWebhookEvents();
      const currentTime = new Date().getTime();

      webhookEvents.forEach(async (webhookEvent) => {
        let success: boolean;
        const { url, token, ...rest } =
          await this.webhookRepository.getWebhookById(webhookEvent.webhookId);

        let decryptedToken: string;
        if (token) {
          decryptedToken = this.cryptr.decrypt(token);
        }

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
