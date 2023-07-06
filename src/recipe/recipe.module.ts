import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  providers: [RecipeService, PrismaService, JwtAuthGuard],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
