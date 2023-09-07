import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ChangePasswordRequest,
  CreatePatResponse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from './dto';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiOperation,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserId } from '../common/decorators/req-user-id.decorator';
import { Enable2FAResponse } from './dto/enable-2fa-response';
import { TwoFactorAuthGuard } from './guards/two-factor-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Authenticate user' })
  @Post('signin')
  async signIn(@Body() signInRequest: SignInRequest): Promise<SignInResponse> {
    const accessToken = await this.authService.signIn(signInRequest);

    return SignInResponse.from(accessToken);
  }

  @HttpCode(201)
  @ApiOperation({ summary: 'Add user to database' })
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiForbiddenResponse({
    description: 'Cannot add User to database, use different credentials',
  })
  @Post('signup')
  async signUp(@Body() signUpRequest: SignUpRequest): Promise<SignUpResponse> {
    const createdUser = await this.authService.signUp(signUpRequest);

    return SignUpResponse.from(createdUser);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/pat')
  async createPersonalAccessToken(
    @UserId() userId: number,
  ): Promise<CreatePatResponse> {
    const patToken = await this.authService.createPersonalAccessToken(userId);
    return CreatePatResponse.from(patToken);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Changes password of the user' })
  @Post('change-password')
  async changePassword(
    @UserId() userId: number,
    @Body() changePasswordRequest: ChangePasswordRequest,
  ) {
    await this.authService.changePassword(
      userId,
      changePasswordRequest.newPassword,
    );
  }

  @Post('enable-2fa')
  async enable2FA(@UserId() userId: number): Promise<Enable2FAResponse> {
    const twoFactorAuthenticationResponse = await this.authService.enable2FA(
      userId,
    );

    return Enable2FAResponse.from(twoFactorAuthenticationResponse);
  }

  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  disable2FA(@UserId() userId: number): void {
    this.authService.disable2FA(userId);
  }

  @UseGuards(TwoFactorAuthGuard)
  @Post('verify-2fa')
  async verify2FA(
    @UserId() userId: number,
    @Body() tokenData: { token: string },
  ): Promise<SignInResponse> {
    const accessToken = await this.authService.verify2FA(
      userId,
      tokenData.token,
    );

    return SignInResponse.from(accessToken);
  }
}
