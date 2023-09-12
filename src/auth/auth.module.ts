import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from './strategies/local.strategy';
import { UserAuthBearerStrategy } from './strategies/auth-user.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PersonalAccessTokenStrategy } from './strategies/pat.strategy';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalAccessTokenRepository } from './personal-access-token.repository';
import { MailModule } from '../mail/mail.module';
import { AccountActivationTimeouts } from './utils/timeout-functions';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    UserAuthBearerStrategy,
    PersonalAccessTokenStrategy,
    UserRepository,
    PersonalAccessTokenRepository,
    PrismaService,
    LocalAuthGuard,
    SchedulerRegistry,
    AccountActivationTimeouts,
  ],
  exports: [AuthService],
})
export class AuthModule {}
