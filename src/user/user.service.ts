import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user-response';
import { UpdateUserRequest, CreateUserRequest } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  createUser(data: CreateUserRequest): Promise<UserDto> {
    return this.userRepository.createUser(data);
  }

  updateUser(payload: UpdateUserRequest): Promise<UserDto> {
    return this.userRepository.updateUser(payload.where, payload.data);
  }

  deleteUser(id: number): Promise<void> {
    return this.userRepository.removeUserById(id);
  }
}
