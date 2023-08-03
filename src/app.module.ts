import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecipeModule } from './recipe/recipe.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisCacheModule } from './cache/redis-cache.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RedisCacheModule,
    RecipeModule,
    PrismaModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
