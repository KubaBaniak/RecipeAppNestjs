import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Put()
  async updateUser(
    @Body()
    userData: {
      where: {
        email: string;
      };
      data: {
        email: string;
      };
    },
  ): Promise<UserModel> {
    return this.userService.updateUser(userData);
  }
}
