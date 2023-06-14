import { Controller, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() userData: Record<string, any>) {
    return this.authService.signIn(userData.email, userData.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async singupUser(@Body() userData: Record<string, any>) {
    return this.authService.signUp(userData.email, userData.password);
  }
}
