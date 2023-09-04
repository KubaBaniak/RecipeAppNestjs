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
import { firstValueFrom } from 'rxjs';

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

    this.webhookRepository.createWebhook(userId, webhookData);
  }

  async deleteWebhook(userId: number, webhookId: number): Promise<void> {
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
    return webhooks.map(({ userId, token, initVector, authTag, ...rest }) => {
      return rest;
    });
  }

  async sendWebhookEvent(
    url: string,
    data: Prisma.JsonValue,
    token?: string,
  ): Promise<boolean> {
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const test = await firstValueFrom(
      this.httpService.post(url, data, {
        headers: headersRequest,
      }),
    );
    return test.status === 200 ? true : false;
  }

  async createWebhookEvent(
    userId: number,
    data: Recipe,
    type: WebhookType,
  ): Promise<void> {
    const userWebhooks = await this.webhookRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach(async (webhook) => {
      if (webhook.type === type) {
        await this.webhookRepository.createWebhookEvent(webhook.id, data, type);
      }
    });
  }
}
