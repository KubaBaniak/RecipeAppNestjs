import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RecipeCacheService } from './recipe.cache.service';
import { S3Service } from './s3-bucket.service';
import { RecipeRepository } from './recipe.repository';
import { UserRepository } from '../user/user.repository';
import { WebsocketService } from '../events/websocket.service';
import { SocketCacheService } from '../events/websocket-cache.service';

@Module({
  imports: [RedisCacheModule],
  providers: [
    RecipeService,
    RecipeRepository,
    RecipeCacheService,
    SocketCacheService,
    PrismaService,
    JwtAuthGuard,
    S3Service,
    UserRepository,
    WebsocketService,
  ],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
