import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';

@Injectable()
export class RecipeRepository {
  constructor(private prisma: PrismaService) {}

  createRecipe(data: CreateRecipeRequest): Promise<Recipe> {
    return this.prisma.recipe.create({
      data,
    });
  }

  getRecipeById(id: number): Promise<Recipe> {
    return this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });
  }

  getAllRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany();
  }

  updateRecipe(id: number, payload: UpdateRecipeRequest): Promise<Recipe> {
    return this.prisma.recipe.update({
      where: { id },
      data: payload,
    });
  }

  deleteRecipe(id: number): Promise<Recipe> {
    return this.prisma.recipe.delete({
      where: { id },
    });
  }
}
