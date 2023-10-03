import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { UserAuthBearerStrategy } from './strategies/auth-user.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PersonalAccessTokenStrategy } from './strategies/pat.strategy';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessTokenRepository } from './personal-access-token.repository';
import { MailModule } from '../mail/mail.module';
import { PasswordResetTokenStrategy } from './strategies/reset-password.strategy';
import { TwoFactorAuthStrategy } from './strategies/two-factor-auth.strategy';
import { TwoFactorAuthRepository } from './twoFactorAuth.repository';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    UserAuthBearerStrategy,
    PersonalAccessTokenStrategy,
    TwoFactorAuthStrategy,
    TwoFactorAuthRepository,
    UserRepository,
    PersonalAccessTokenRepository,
    PasswordResetTokenStrategy,
    PrismaService,
    LocalAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
