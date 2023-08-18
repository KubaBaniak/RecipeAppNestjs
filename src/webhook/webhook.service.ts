import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWebhookRequest } from './dto';
import { PATRepository } from './webhook.repository';
import { Recipe, Webhook } from '@prisma/client';
import Cryptr from 'cryptr';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly patRepository: PATRepository,
  ) {}
  cryptr = new Cryptr(process.env.CRYPTR_SECRET_KEY);

  async createWebhook(
    userId: number,
    webhookData: CreateWebhookRequest,
  ): Promise<void> {
    const userWebhooks = await this.patRepository.getAllWebhooksByUserId(
      userId,
    );
    if (userWebhooks.length >= 5) {
      throw new ForbiddenException();
    }

    if (webhookData.token) {
      const encryptedString = this.cryptr.encrypt(webhookData.token);
      webhookData.token = encryptedString;
    }

    this.patRepository.createWebhook(userId, webhookData);
  }

  async deleteWebhook(userId: number, webhookId: number) {
    const webhook = await this.patRepository.getWebhookById(webhookId);
    if (!webhook) {
      throw new NotFoundException();
    }
    if (userId !== webhook.userId) {
      throw new UnauthorizedException();
    }
    this.patRepository.deleteUserWebhookByName(webhookId);
  }

  async getWebhooksById(userId: number): Promise<Webhook[]> {
    return this.patRepository.getAllWebhooksByUserId(userId);
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

  async recipeCreated(userId: number, data: Recipe) {
    const userWebhooks = await this.patRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === 'CREATE') {
        this.sendToWebhook(webhook.url, data, webhook.token);
      }
    });
  }

  async recipeUpdated(userId: number, data: Recipe) {
    const userWebhooks = await this.patRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === 'UPDATE') {
        this.sendToWebhook(webhook.url, data, webhook.token);
      }
    });
  }

  async recipeDeleted(userId: number, data: Recipe) {
    const userWebhooks = await this.patRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === 'DELETE') {
        this.sendToWebhook(webhook.url, data, webhook.token);
      }
    });
  }
}
