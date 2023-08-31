import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWebhookRequest, WebhookType, FetchedWebhook } from './dto';
import { WebhookRepository } from './webhook.repository';
import { Prisma, Recipe, Webhook } from '@prisma/client';
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
  ): Promise<Webhook> {
    const userWebhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    if (userWebhooks.length >= +process.env.WEBHOOK_LIMIT) {
      throw new ForbiddenException('Reached limit of owned webhooks');
    }

    if (webhookData.token) {
      const encryptedString = this.cryptr.encrypt(webhookData.token);
      webhookData.token = encryptedString;
    }

    return this.webhookRepository.createWebhook(userId, webhookData);
  }

  async deleteWebhook(userId: number, webhookId: number) {
    const webhook = await this.webhookRepository.getWebhookById(webhookId);
    if (!webhook) {
      throw new NotFoundException();
    }
    if (userId !== webhook.userId) {
      throw new ForbiddenException();
    }
    await this.webhookRepository.deleteUserWebhookById(webhookId);
  }

  async getWebhooksByUserId(userId: number): Promise<FetchedWebhook[]> {
    const webhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    return webhooks.map(({ userId, token, ...rest }) => {
      return rest;
    });
  }

  sendWebhookEvent(
    url: string,
    data: Prisma.JsonValue,
    token?: string,
  ): boolean {
    let success = false;
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.httpService
      .post(url, data, {
        headers: headersRequest,
      })
      .subscribe({
        complete: () => {
          success = true;
        },
        error: (err) => {
          console.error(err);
        },
      });
    return success;
  }

  async createWebhookEvent(
    userId: number,
    data: Recipe,
    type: WebhookType,
  ): Promise<void> {
    const userWebhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === type)
        this.webhookRepository.createWebhookEvent(webhook.id, data, type);
    });
  }
}
