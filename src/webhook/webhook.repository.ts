import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Webhook } from '@prisma/client';
import { CreateWebhookRequest } from 'src/webhook/dto';

@Injectable()
export class WebhookRepository {
  constructor(private prisma: PrismaService) {}

  async createWebhook(
    userId: number,
    webhookData: CreateWebhookRequest,
  ): Promise<Webhook> {
    return this.prisma.webhook.create({
      data: {
        ...webhookData,
        userId,
      },
    });
  }

  async getAllWebhooksByUserId(userId: number): Promise<Webhook[]> {
    return this.prisma.webhook.findMany({
      where: {
        userId,
      },
    });
  }

  async getWebhookById(webhookId: number): Promise<Webhook> {
    return this.prisma.webhook.findUnique({
      where: {
        id: webhookId,
      },
    });
  }

  async deleteUserWebhookById(webhookId: number): Promise<void> {
    await this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }
}
