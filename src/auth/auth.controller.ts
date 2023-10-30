import {
  Controller,
  Body,
  Post,
  Get,
  HttpCode,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  ChangePasswordRequest,
  CreatePatResponse,
  CreateQrCodeFor2FA,
  RecoveryKeysRespnse,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
  ResetPasswordRequest,
  ResetPasswordEmailRequest,
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
import { MailService } from '../mail/mail.service';
import { PasswordResetAuthGuard } from './guards/reset-password.guard';
import { TwoFactorAuthGuard } from './guards/two-factor-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

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
    const { email, accountActivationToken } = await this.authService.signUp(
      signUpRequest,
    );

    await this.mailService.sendAccountActivationEmail(
      email,
      accountActivationToken,
    );

    return SignUpResponse.from(accountActivationToken);
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

  @HttpCode(200)
  @Get('activate-account')
  async activateAccount(@Query('token') token: string): Promise<void> {
    await this.authService.activateAccount(token);
  }

  @ApiOperation({ summary: 'Sends link to resets password of the user' })
  @Post('request-reset-password')
  async resetPasswordEmail(
    @Body() resetPasswordRequest: ResetPasswordEmailRequest,
  ): Promise<void> {
    const resetPasswordToken =
      await this.authService.generateResetPasswordToken(
        resetPasswordRequest.email,
      );

    await this.mailService.sendResetPasswordEmail(
      resetPasswordRequest.email,
      resetPasswordToken,
    );
  }

  @HttpCode(200)
  @UseGuards(PasswordResetAuthGuard)
  @ApiOperation({ summary: 'Resets password of the user' })
  @Post('reset-password')
  async resetPassword(
    @UserId() userId: number,
    @Body() resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    console.log(resetPasswordRequest);
    await this.authService.changePassword(
      userId,
      resetPasswordRequest.newPassword,
    );
  }

  @HttpCode(201)
  @ApiOperation({
    summary:
      'Creates QR code for user to scan it for auth app (like Google Authenticator)',
  })
  @UseGuards(JwtAuthGuard)
  @Post('create-qr-code-for-2fa-authenticator-app')
  async createQrCodeFor2fa(
    @UserId() userId: number,
  ): Promise<CreateQrCodeFor2FA> {
    const qrCode = await this.authService.createQrCodeFor2fa(userId);

    return CreateQrCodeFor2FA.from(qrCode);
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
  ): Promise<RecoveryKeysRespnse> {
    const recoveryKey = await this.authService.enable2fa(
      userId,
      twoFactorAuthTokenData.token,
    );

    return RecoveryKeysRespnse.from(recoveryKey);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Disables 2FA for logged user' })
  @UseGuards(JwtAuthGuard)
  @Post('disable-2fa')
  async disable2fa(@UserId() userId: number): Promise<void> {
    await this.authService.disable2fa(userId);
  }

  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with 2FA to login' })
  @UseGuards(TwoFactorAuthGuard)
  @Post('verify-2fa')
  async verify2FA(
    @UserId() userId: number,
    @Body() tokenData: Verify2FARequest,
  ): Promise<SignInResponse> {
    const accessToken = await this.authService.verify2fa(
      userId,
      tokenData.token,
    );

    return SignInResponse.from(accessToken);
  }

  @HttpCode(201)
  @ApiOperation({ summary: 'Regenerate recovery keys for 2FA' })
  @UseGuards(JwtAuthGuard)
  @Post('regenerate-recovery-keys')
  async regenerateRecoveryKeys(
    @UserId() userId: number,
  ): Promise<RecoveryKeysRespnse> {
    const recoveryKeys = await this.authService.generate2faRecoveryKeys(userId);

    return RecoveryKeysRespnse.from(recoveryKeys);
  }
}
