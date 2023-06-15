import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Body() user: User) {
    return await this.authService.signIn(user);
  }

  @HttpCode(201)
  @Post('signup')
  async singUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }
}
