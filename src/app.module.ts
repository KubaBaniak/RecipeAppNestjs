import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';

@Module({
  imports: [PrismaModule, AuthModule, UserModule],
  controllers: [AppController, UserController, AuthController],
  providers: [AppService, UserService, AuthService, LocalAuthGuard],
})
export class AppModule {}
