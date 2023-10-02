import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
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
}
