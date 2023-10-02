import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  UserPayloadRequest,
  UpdateUserRequest,
  CreateUserRequest,
} from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  createUser(data: CreateUserRequest): Promise<UserPayloadRequest> {
    return this.userRepository.createUser(data);
  }

  updateUser(payload: UpdateUserRequest): Promise<UserPayloadRequest> {
    return this.userRepository.updateUserById(payload.id, payload.data);
  }

  deleteUser(id: number): Promise<User> {
    return this.userRepository.removeUserById(id);
  }
}
