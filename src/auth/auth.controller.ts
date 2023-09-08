import { Controller, Body, Post, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ChangePasswordRequest,
  CreatePatResponse,
  CreateQrcodeFor2FA,
  Enable2FARespnse,
  Recovery2FARequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  Verify2FARequest,
} from './dto';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiOperation,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserId } from '../common/decorators/req-user-id.decorator';
import { TwoFactorAuthGuard } from './guards/two-factor-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @HttpCode(201)
  @ApiOperation({ summary: 'Add PAT for user' })
  @UseGuards(JwtAuthGuard)
  @Post('create/pat')
  async createPersonalAccessToken(
    @UserId() userId: number,
  ): Promise<CreatePatResponse> {
    const patToken = await this.authService.createPersonalAccessToken(userId);
    return CreatePatResponse.from(patToken);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Changes password of the user' })
  @UseGuards(JwtAuthGuard)
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

  @HttpCode(201)
  @ApiOperation({
    summary:
      'Creates QR code for user to scan it for auth app (like google Authenticator)',
  })
  @UseGuards(JwtAuthGuard)
  @Post('create-qr-2fa')
  async createQrcodeFor2FA(
    @UserId() userId: number,
  ): Promise<CreateQrcodeFor2FA> {
    const qrcode = await this.authService.createQrcodeFor2FA(userId);

    return CreateQrcodeFor2FA.from(qrcode);
  }

  @HttpCode(200)
  @ApiOperation({
    summary: 'Enables 2FA authentication for user',
  })
  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  async enable2FA(
    @UserId() userId: number,
    @Body() twoFactorAuthTokenData: Verify2FARequest,
  ): Promise<Enable2FARespnse> {
    const recoveryKeys = await this.authService.enable2FA(
      userId,
      twoFactorAuthTokenData.token,
    );

    return Enable2FARespnse.from(recoveryKeys);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Disables 2FA for logged user' })
  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  disable2FA(@UserId() userId: number): void {
    this.authService.disable2FA(userId);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with 2FA to login' })
  @UseGuards(TwoFactorAuthGuard)
  @Post('verify-2fa')
  async verify2FA(
    @UserId() userId: number,
    @Body() tokenData: Verify2FARequest,
  ): Promise<SignInResponse> {
    const accessToken = await this.authService.verify2FA(
      userId,
      tokenData.token,
    );

    return SignInResponse.from(accessToken);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Recover account with recovery keys to login' })
  @UseGuards(TwoFactorAuthGuard)
  @Post('recovery-2fa')
  async recoverAccountWith2FA(
    @UserId() userId: number,
    @Body() recoveryData: Recovery2FARequest,
  ): Promise<SignInResponse> {
    const accessToken = await this.authService.recoverAccountWith2FA(
      userId,
      recoveryData.recoveryKey,
    );

    return SignInResponse.from(accessToken);
  }
}
