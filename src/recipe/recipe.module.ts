import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RecipeCacheService } from './recipe.cache.service';

@Module({
  imports: [RedisCacheModule],
  providers: [RecipeService, PrismaService, JwtAuthGuard, RecipeCacheService],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
