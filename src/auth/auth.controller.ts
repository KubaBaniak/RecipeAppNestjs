import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  SignInRequestDto,
  SignInResponseDto,
  SignUpRequestDto,
  SignUpResponseDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(
    @Body() signInRequest: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    const authServiceResult = await this.authService.signIn(signInRequest);

    return SignInResponseDto.from(authServiceResult);
  }

  @HttpCode(201)
  @Post('signup')
  async signUp(
    @Body() signUpRequest: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    const authServiceResult = await this.authService.signUp(signUpRequest);

    return SignUpResponseDto.from(authServiceResult);
  }
}
