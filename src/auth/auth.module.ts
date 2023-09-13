import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { UserAuthBearerStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PersonalAccessTokenStrategy } from './strategies/pat.strategy';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessTokenRepository } from './personal-access-token.repository';
import { TwoFactorAuthStrategy } from './strategies/two-factor-auth.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    UserAuthBearerStrategy,
    PersonalAccessTokenStrategy,
    TwoFactorAuthStrategy,
    UserRepository,
    PersonalAccessTokenRepository,
    PrismaService,
    LocalAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
