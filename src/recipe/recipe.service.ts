import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Recipe, Prisma } from '@prisma/client';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  createRecipe(data: Prisma.RecipeCreateInput): Promise<Recipe> {
    return this.prisma.recipe.create({
      data,
    });
  }

  async fetchRecipe(id: number): Promise<Recipe> {
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });

    if (!recipe) {
      throw new NotFoundException();
    }

    return recipe;
  }

  fetchAllRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany();
  }

  updateRecipe(
    id: number,
    payload: {
      title: string;
      description: string;
      ingredients: string;
      preparation: string;
    },
  ): Promise<Recipe> {
    const recipe = this.prisma.recipe.update({
      where: { id },
      data: {
        title: payload.title,
        description: payload.description,
        ingredients: payload.ingredients,
        preparation: payload.preparation,
      },
    });
    return recipe;
  }
}
