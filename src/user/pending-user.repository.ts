import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PendingUsers, Prisma } from '@prisma/client';

@Injectable()
export class PendingUsersRepository {
  constructor(private prisma: PrismaService) {}

  createPendingUser(
    data: Prisma.PendingUsersCreateInput,
  ): Promise<PendingUsers> {
    return this.prisma.pendingUsers.create({ data });
  }

  getPendingUserById(id: number): Promise<{ email: string }> {
    return this.prisma.pendingUsers.findUnique({
      select: {
        email: true,
      },
      where: { id },
    });
  }

  getAllPendingUsers(): Promise<PendingUsers[]> {
    return this.prisma.pendingUsers.findMany();
  }

  getPendingUserByEmail(email: string): Promise<PendingUsers> {
    return this.prisma.pendingUsers.findUnique({
      where: { email },
    });
  }

  removePendingUserById(id: number): Promise<PendingUsers> {
    return this.prisma.pendingUsers.delete({
      where: { id },
    });
  }
}
