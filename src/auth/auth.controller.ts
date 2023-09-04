import {
  Controller,
  Body,
  Post,
  Get,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
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

  @UseGuards(JwtAuthGuard)
  @Post('create/pat')
  async createPersonalAccessToken(
    @UserId() userId: number,
  ): Promise<CreatePatResponse> {
    const patToken = await this.authService.createPersonalAccessToken(userId);
    return CreatePatResponse.from(patToken);
  }
}
