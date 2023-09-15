import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PendingUser, Prisma, User } from '@prisma/client';
import { UserPayloadRequest } from './dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  getUserById(id: number): Promise<User> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  getUserByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({
      where: { email },
    });
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

  createPendingUser(data: Prisma.PendingUserCreateInput): Promise<PendingUser> {
    return this.prisma.pendingUser.create({ data });
  }

  getPendingUserById(id: number): Promise<{ email: string; password: string }> {
    return this.prisma.pendingUser.findUnique({
      select: {
        email: true,
        password: true,
      },
      where: { id },
    });
  }

  getAllPendingUsers(): Promise<PendingUser[]> {
    return this.prisma.pendingUser.findMany();
  }

  getPendingUserByEmail(email: string): Promise<PendingUser> {
    return this.prisma.pendingUser.findUnique({
      where: { email },
    });
  }

  removePendingUserById(id: number): Promise<PendingUser> {
    return this.prisma.pendingUser.delete({
      where: { id },
    });
  }

  saveAccountActivationToken(
    userId: number,
    token: string,
  ): Promise<PendingUser> {
    return this.prisma.pendingUser.update({
      data: {
        accountActivationToken: token,
      },
      where: {
        id: userId,
      },
    });
  }

  getAccountActivationToken(
    userId: number,
  ): Promise<{ accountActivationToken: string }> {
    return this.prisma.pendingUser.findUnique({
      where: {
        id: userId,
      },
      select: {
        accountActivationToken: true,
      },
    });
  }
}
