import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: `${process.env.JWT_EXPIRY_TIME}s` },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    PrismaService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
