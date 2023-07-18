import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';

@Injectable()
export class RecipeRepository {
  constructor(private prisma: PrismaService) {}

  async createRecipe(data: CreateRecipeRequest): Promise<Recipe> {
    const recipe = await this.prisma.recipe.create({
      data,
    });

    return recipe;
  }

  async getRecipeById(id: number): Promise<Recipe> {
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

  async deleteRecipe(id: number): Promise<Recipe> {
    return this.prisma.recipe.delete({
      where: { id },
    });
  }
}
