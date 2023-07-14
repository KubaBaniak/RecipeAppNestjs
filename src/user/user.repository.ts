import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserDto } from './dto/user-response';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async getUser(where: Prisma.UserWhereUniqueInput): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where,
    });

    return UserDto.from(user);
  }

  getUserWithPassword(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.findUnique({
      where,
    });
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

  async removeUser(where: Prisma.UserWhereUniqueInput): Promise<void> {
    this.prisma.user.delete({
      where,
    });
  }
}
