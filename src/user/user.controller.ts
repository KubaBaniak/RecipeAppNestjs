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

  @Post('signup')
  async singupUser(
    @Body() userData: { email: string; password: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Post('login')
  async loginUser(
    @Body() userData: { email: string; password: string },
  ): Promise<UserModel> {
    return this.userService.user(userData);
  }

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
