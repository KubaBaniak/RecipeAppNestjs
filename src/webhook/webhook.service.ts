import { HttpService } from '@nestjs/axios';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWebhookRequest, ListWebhooksDto } from './dto';
import { PATRepository } from './webhook.repository';
import { Recipe } from '@prisma/client';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly patRepository: PATRepository,
  ) {}

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

  async getWebhooksById(userId: number): Promise<ListWebhooksDto[]> {
    return this.patRepository.getAllWebhooksByUserId(userId);
  }

  sendToWebhook(url: string, data: any, token?: string): void {
    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.httpService
      .post(url, data, {
        headers: headersRequest,
      })
      .subscribe();
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
