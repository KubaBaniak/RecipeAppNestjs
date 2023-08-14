import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class WebhookService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
  ) {}

  createWebhook(
    userId: number,
    webhookDataTemp: { name: string; type: string },
  ): void {
    const webhookData = {
      ...webhookDataTemp,
      url: 'https://webhook.site/67acb81c-04cd-48b4-a4bd-dd711262685c',
    };
    this.userRepository.createWebhook(userId, webhookData);
  }

  sendToWebhook(url: string, data: any, token?: string): void {
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${token}`,
    };
    this.httpService.post(url, data, {
      headers: headersRequest,
    });
  }

  async recipeCreated(userId: number, data: any) {
    const userWebhooks = await this.userRepository.getAllWebhooksByUserId(
      userId,
    );
    userWebhooks.forEach((webhook) => {
      if (webhook.type === 'CREATE') {
        this.sendToWebhook(webhook.url, data);
      }
    });
  }

  recipeUpdated(url: string, data: any, token?: string) {
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${token}`,
    };
    this.httpService
      .post(url, data, {
        headers: headersRequest,
      })
      .subscribe({
        error: (err) => {
          console.log(err);
        },
      });
    return HttpStatus.CREATED;
  }

  recipeDeleted(url: string, data: any, token?: string) {
    const headersRequest = {
      'Content-Type': 'application/json', // afaik this one is not needed
      Authorization: `Bearer ${token}`,
    };
    this.httpService
      .post(url, data, {
        headers: headersRequest,
      })
      .subscribe({
        error: (err) => {
          console.log(err);
        },
      });
    return HttpStatus.CREATED;
  }
}
