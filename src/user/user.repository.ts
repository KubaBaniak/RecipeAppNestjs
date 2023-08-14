import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User, Webhook } from '@prisma/client';
import { UserPayloadRequest } from './dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number): Promise<UserPayloadRequest> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? UserPayloadRequest.from(user) : null;
  }

  async getUserByEmailWithPassword(email: string): Promise<UserPayloadRequest> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? UserPayloadRequest.withPasswordFrom(user) : null;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<UserPayloadRequest> {
    const user = await this.prisma.user.create({
      data,
    });

    return user ? UserPayloadRequest.from(user) : null;
  }

  async updateUserById(
    id: number,
    data: Prisma.UserUpdateInput,
  ): Promise<UserPayloadRequest> {
    const user = await this.prisma.user.update({
      data,
      where: { id },
    });

    return user ? UserPayloadRequest.from(user) : null;
  }

  async removeUserById(id: number): Promise<void> {
    this.prisma.user.delete({
      where: { id },
    });
  }

  async createWebhook(
    userId: number,
    webhookData: { name: string; type: string; url: string },
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        webhooks: {
          create: {
            ...webhookData,
          },
        },
      },
    });
  }

  async getAllWebhooksByUserId(userId: number): Promise<Webhook[]> {
    return this.prisma.webhook.findMany({
      where: {
        id: userId,
      },
    });
  }

  async getWebhookById(userId: number): Promise<Webhook> {
    return this.prisma.webhook.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async deleteUserWebhookByName(webhookId: number): Promise<void> {
    await this.prisma.webhook.delete({
      where: {
        id: webhookId,
      },
    });
  }
}
