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
import { MailModule } from '../mail/mail.module';
import { PasswordResetTokenStrategy } from './strategies/reset-password.strategy';
import { PendingUsersRepository } from '../user/pending-user.repository';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    MailModule,
    RabbitMQModule.forRoot(RabbitMQModule, {
      exchanges: [
        {
          name: 'authentication',
          type: 'topic',
        },
      ],
      uri: process.env.RABBITMQ_ADDRESS,
    }),
    AuthModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    UserAuthBearerStrategy,
    PersonalAccessTokenStrategy,
    UserRepository,
    PendingUsersRepository,
    PasswordResetTokenStrategy,
    PrismaService,
    LocalAuthGuard,
  ],
  exports: [AuthService, RabbitMQModule],
})
export class AuthModule {}
