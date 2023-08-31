import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Webhook, WebhookEvent } from '@prisma/client';
import { CreateWebhookRequest, WebhookType } from 'src/webhook/dto';

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

  async createWebhookEvent(
    webhookId: number,
    data: any,
    webhookType: WebhookType,
  ): Promise<WebhookEvent> {
    return this.prisma.webhookEvent.create({
      data: {
        data,
        type: webhookType,
        webhookId,
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

  deleteUserWebhookById(webhookId: number): Promise<Webhook> {
    return this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }

  getAllValidWebhookEvents(): Promise<WebhookEvent[]> {
    return this.prisma.webhookEvent.findMany({
      where: {
        status: 'Pending',
      },
    });
  }

  updateWebhookEventStatus(
    webhookEventId: number,
    status: string,
  ): Promise<WebhookEvent> {
    return this.prisma.webhookEvent.update({
      where: {
        id: webhookEventId,
      },
      data: {
        status,
      },
    });
  }

  updateAttemptAndSentAt(
    webhookEventId: number,
    currentAttempt: number,
  ): Promise<WebhookEvent> {
    return this.prisma.webhookEvent.update({
      where: {
        id: webhookEventId,
      },
      data: {
        attempt: currentAttempt + 1,
        sentAt: new Date(),
      },
    });
  }
}
