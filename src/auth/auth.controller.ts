import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '@prisma/client';
import { AuthDto, SignInResponseDto, SignUpResponseDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Body() user: User): Promise<SignInResponseDto> {
    const authServiceResult = await this.authService.signIn(user);

    return SignInResponseDto.from(authServiceResult);
  }

  @HttpCode(201)
  @Post('signup')
  async singUp(@Body() dto: AuthDto): Promise<SignUpResponseDto> {
    const authServiceResult = await this.authService.signUp(dto);

    return SignUpResponseDto.from(authServiceResult);
  }
}
