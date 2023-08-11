import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PAT, Prisma } from '@prisma/client';
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

  async createPat(userId: number, token: string) {
    const test = this.prisma.pAT.create({
      data: {
        token,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    console.log(await this.prisma.pAT.findMany());
    return test;
  }

  async getUserValidPatWithId(userId: number): Promise<PAT> {
    return this.prisma.pAT.findFirst({
      where: {
        userId,
        invalidatedAt: {
          equals: null,
        },
      },
    });
  }

  async invalidateUserPat(userId: number): Promise<void> {
    await this.prisma.pAT.updateMany({
      where: {
        userId,
      },
      data: {
        invalidatedAt: new Date(),
      },
    });
  }
}
