import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  providers: [RecipeService, PrismaService, JwtAuthGuard, JwtStrategy],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
