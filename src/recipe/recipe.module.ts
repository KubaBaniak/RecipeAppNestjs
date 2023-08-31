import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RecipeCacheService } from './recipe.cache.service';
import { S3Service } from './s3-bucket.service';
import { RecipeRepository } from './recipe.repository';
import { WebSocketEventModule } from '../websocket/websocket-event.module';
import { WebhookService } from '../webhook/webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookRepository } from '../webhook/webhook.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [RedisCacheModule, WebSocketEventModule, HttpModule],
  providers: [
    RecipeService,
    RecipeRepository,
    RecipeCacheService,
    PrismaService,
    JwtAuthGuard,
    S3Service,
    WebhookService,
    WebhookRepository,
    UserRepository,
  ],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
