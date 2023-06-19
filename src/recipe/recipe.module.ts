import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Module({
<<<<<<< HEAD
  providers: [RecipeService, PrismaService, JwtStrategy, JwtAuthGuard],
=======
  providers: [RecipeService, PrismaService, JwtAuthGuard],
>>>>>>> main
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
