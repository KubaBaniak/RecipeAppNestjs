import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TwoFactorAuth, TwoFactorAuthRecoveryKey } from '@prisma/client';

@Injectable()
export class TwoFactorAuthRepository {
  constructor(private prisma: PrismaService) {}

  async is2faEnabledForUserWithId(
    userId: number,
  ): Promise<{ isEnabled: boolean }> {
    return this.prisma.twoFactorAuth.findUnique({
      select: {
        isEnabled: true,
      },
      where: { userId },
    });
  }

  async enable2faForUserWithId(userId: number): Promise<TwoFactorAuth> {
    return this.prisma.twoFactorAuth.update({
      data: {
        isEnabled: true,
      },
      where: { userId },
    });
  }

  async disable2faForUserWithId(userId: number): Promise<TwoFactorAuth> {
    return this.prisma.twoFactorAuth.update({
      data: {
        isEnabled: false,
      },
      where: { userId },
    });
  }

  async get2faSecretKeyForUserWithId(userId: number): Promise<{
    secretKey: string;
  }> {
    return this.prisma.twoFactorAuth.findUnique({
      select: {
        secretKey: true,
      },
      where: { userId },
    });
  }

  async get2faRecoveryKeysForUserWithId(userId: number): Promise<{
    recoveryKeys: { key: string; isUsed: boolean }[];
  }> {
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
}
