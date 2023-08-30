import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessToken } from '@prisma/client';

@Injectable()
export class PersonalAccessTokenRepository {
  constructor(private prisma: PrismaService) {}

  savePersonalAccessToken(
    userId: number,
    token: string,
  ): Promise<PersonalAccessToken> {
    return this.prisma.personalAccessToken.create({
      data: {
        token,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  getValidPatForUserId(userId: number): Promise<PersonalAccessToken> {
    return this.prisma.personalAccessToken.findFirst({
      where: {
        userId,
        invalidatedAt: {
          equals: null,
        },
      },
    });
  }

  async invalidatePatForUserId(userId: number): Promise<void> {
    await this.prisma.personalAccessToken.updateMany({
      where: {
        userId,
      },
      data: {
        invalidatedAt: new Date(),
      },
    });
  }
}
