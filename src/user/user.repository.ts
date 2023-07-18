import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UserDto } from './dto/user-response';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return UserDto.from(user);
  }

  async getUserByIdWithPassword(id: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return UserDto.fromWithPassword(user);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<UserDto> {
    const user = await this.prisma.user.create({
      data,
    });

    return UserDto.from(user);
  }

  async updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<UserDto> {
    const user = await this.prisma.user.update({
      data,
      where,
    });

    return UserDto.from(user);
  }

  async removeUserById(id: number): Promise<void> {
    this.prisma.user.delete({
      where: { id },
    });
  }
}
