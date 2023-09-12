import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
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

  removeUserById(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async activateAccount(userId: number): Promise<User> {
    return this.prisma.user.update({
      data: {
        activated: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async saveAccountActivationToken(userId: number, token: string) {
    return this.prisma.user.update({
      data: {
        accountActivationToken: token,
      },
      where: {
        id: userId,
      },
    });
  }

  async getAccountActivationToken(
    userId: number,
  ): Promise<{ accountActivationToken: string }> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accountActivationToken: true,
      },
    });
  }
}
