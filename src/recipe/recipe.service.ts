import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';

@Injectable()
export class RecipeService {
  constructor(private prisma: PrismaService) {}

  async createRecipe(
    data: CreateRecipeRequest,
    user_id: number,
  ): Promise<Recipe> {
    const { title, description, ingredients, preparation, isPublic } = data;
    return this.prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        preparation,
        isPublic,
        authorId: user_id,
      },
    });
  }

  async fetchRecipe(recipe_id: number, user_id: number): Promise<Recipe> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipe_id,
      },
    });

    if (!recipe) {
      throw new NotFoundException();
    }

    if (user_id != recipe.authorId && user.role != 'ADMIN') {
      throw new ForbiddenException();
    }

    return recipe;
  }

  fetchAllRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany();
  }

  async updateRecipe(
    id: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    try {
      const recipe = await this.prisma.recipe.update({
        where: { id },
        data: payload,
      });
      return recipe;
    } catch {
      throw new NotFoundException();
    }
  }

  async deleteRecipe(id: number): Promise<void> {
    try {
      await this.prisma.recipe.delete({
        where: { id },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}
