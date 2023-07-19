import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user-response';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  createUser(data: Prisma.UserCreateInput): Promise<UserDto> {
    return this.userRepository.createUser(data);
  }

  updateUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<UserDto> {
    return this.userRepository.updateUser(where, data);
  }

  deleteUser(where: Prisma.UserWhereUniqueInput): Promise<void> {
    return this.userRepository.removeUserById(where.id);
  }
}
