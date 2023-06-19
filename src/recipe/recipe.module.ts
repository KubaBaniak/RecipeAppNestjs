import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [RecipeService, PrismaService],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
