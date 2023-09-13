import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  TwoFactorAuth,
  TwoFactorAuthRecoveryKey,
} from '@prisma/client';
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

  getUserByEmail(
    email: string,
  ): Promise<Prisma.UserGetPayload<{ include: { twoFactorAuth: true } }>> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        twoFactorAuth: true,
      },
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

  async removeUserById(id: number): Promise<void> {
    this.prisma.user.delete({
      where: { id },
    });
  }

  async disable2FAForUserWithId(id: number): Promise<TwoFactorAuth> {
    return this.prisma.twoFactorAuth.delete({
      where: { id },
    });
  }

  async get2faRecoveryKeysByUserId(
    userId: number,
  ): Promise<{ recoveryKeys: { key: string; isUsed: boolean }[] }> {
    return this.prisma.twoFactorAuth.findUnique({
      select: {
        recoveryKeys: {
          select: {
            key: true,
            isUsed: true,
          },
        },
      },
      where: { userId },
    });
  }

  async expire2faRecoveryKey(key: string): Promise<TwoFactorAuthRecoveryKey> {
    return this.prisma.twoFactorAuthRecoveryKey.update({
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
      where: {
        key,
      },
    });
  }

  async saveRecoveryKeysForUserWithId(
    userId: number,
    recoveryKeys: { key: string }[],
  ): Promise<TwoFactorAuth> {
    return this.prisma.twoFactorAuth.update({
      data: {
        recoveryKeys: {
          createMany: {
            data: recoveryKeys,
          },
        },
      },
      where: {
        userId,
      },
    });
  }

  async get2faSecretKeyForUserWithId(
    userId: number,
  ): Promise<{ secretKey: string }> {
    return this.prisma.twoFactorAuth.findUnique({
      select: {
        secretKey: true,
      },
      where: {
        userId,
      },
    });
  }

  async save2faSecretKeyForUserWithId(
    userId: number,
    secretKey: string,
  ): Promise<TwoFactorAuth> {
    return this.prisma.twoFactorAuth.create({
      data: {
        userId,
        secretKey,
      },
    });
  }
}
