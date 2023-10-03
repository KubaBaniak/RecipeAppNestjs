import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PendingUser, Prisma } from '@prisma/client';

@Injectable()
export class PendingUserRepository {
  constructor(private prisma: PrismaService) {}

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
}
