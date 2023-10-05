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
import { PendingUsersRepository } from '../user/pending-user.repository';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://127.0.0.1:5672'],
          queue: 'auth_queue',
          noAck: true,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
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
    PendingUsersRepository,
    PersonalAccessTokenRepository,
    PasswordResetTokenStrategy,
    PrismaService,
    LocalAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
