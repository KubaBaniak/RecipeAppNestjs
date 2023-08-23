import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWebhookRequest, FetchedWebhook, WebhookEvent } from './dto';
import { WebhookRepository } from './webhook.repository';
import { Recipe } from '@prisma/client';
import Cryptr from 'cryptr';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly webhookRepository: WebhookRepository,
  ) {}
  cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);

  async createWebhook(
    userId: number,
    webhookData: CreateWebhookRequest,
  ): Promise<void> {
    const userWebhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    if (userWebhooks.length >= +process.env.WEBHOOK_LIMIT) {
      throw new ForbiddenException();
    }

    if (webhookData.token) {
      const encryptedString = this.cryptr.encrypt(webhookData.token);
      webhookData.token = encryptedString;
    }

    this.webhookRepository.createWebhook(userId, webhookData);
  }

  async deleteWebhook(userId: number, webhookId: number) {
    const webhook = await this.webhookRepository.getWebhookById(webhookId);
    if (!webhook) {
      throw new NotFoundException();
    }
    if (userId !== webhook.userId) {
      throw new UnauthorizedException();
    }
    this.webhookRepository.deleteUserWebhookById(webhookId);
  }

  async getWebhooksByUserId(userId: number): Promise<FetchedWebhook[]> {
    const webhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    return webhooks.map(({ userId, ...rest }) => {
      return rest;
    });
  }

  sendToWebhook(url: string, data: Recipe, token?: string, attempt = 0): void {
    let decryptedToken: string;
    if (token) {
      decryptedToken = this.cryptr.decrypt(token);
    }
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.httpService
      .post(url, data, {
        headers: headersRequest,
      })
      .subscribe({
        error: () => {
          const maxWaitingTime = 86400 * 1000;
          const nextTryInSec = Math.min(Math.pow(2, attempt + 1) * 1000);
          if (nextTryInSec > maxWaitingTime) {
            throw new NotFoundException({
              message: 'Could not send data to provided URL',
            });
          }
          setTimeout(() => {
            this.sendToWebhook(url, data, token, attempt + 1);
          }, nextTryInSec);
        },
      });
  }

  async sendWebhookEvent(userId: number, data: Recipe, event: WebhookEvent) {
    const userWebhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === event) {
        this.sendToWebhook(webhook.url, data, webhook.token);
      }
    });
  }
}
