import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWebhookRequest, WebhookType, FetchedWebhook } from './dto';
import { WebhookRepository } from './webhook.repository';
import { Prisma, Recipe, Webhook } from '@prisma/client';
import { TokenCrypt } from './utils/crypt-webhook-token';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly webhookRepository: WebhookRepository,
    private readonly tokenCrypt: TokenCrypt,
  ) {}

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
      const { encryptedToken, iv, authTag } = this.tokenCrypt.encryptToken(
        webhookData.token,
      );
      webhookData.token = encryptedToken;

      return this.webhookRepository.createWebhook(
        userId,
        webhookData,
        iv,
        authTag,
      );
    }

    return this.webhookRepository.createWebhook(userId, webhookData);
  }

  async deleteWebhook(userId: number, webhookId: number): Promise<Webhook> {
    const webhook = await this.webhookRepository.getWebhookById(webhookId);
    if (!webhook) {
      throw new NotFoundException();
    }
    if (userId !== webhook.userId) {
      throw new ForbiddenException();
    }
    return this.webhookRepository.deleteUserWebhookById(webhookId);
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
