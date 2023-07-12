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
    userId: number,
  ): Promise<Recipe> {
    const { title, description, ingredients, preparation, isPublic } = data;
    return this.prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        preparation,
        isPublic,
        authorId: userId,
      },
    });
  }

  async fetchRecipe(recipeId: number, userId: number): Promise<Recipe> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      throw new NotFoundException();
    }

    if (
      user.id != recipe.authorId &&
      user.role != 'ADMIN' &&
      !recipe.isPublic
    ) {
      throw new ForbiddenException();
    }

    if (user.id != recipe.authorId && !recipe.isPublic) {
      throw new ForbiddenException();
    }

    return recipe;
  }

  async fetchAllRecipes(userId: number): Promise<Recipe[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user.role === 'ADMIN') {
      return this.prisma.recipe.findMany();
    } else {
      return this.prisma.recipe.findMany({
        where: {
          isPublic: true,
        },
      });
    }
  }

  async updateRecipe(
    userId: number,
    recipeId: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    let recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    try {
      if (user.id != recipe.authorId && user.role != 'ADMIN') {
        throw new ForbiddenException();
      }
      recipe = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: payload,
      });
    } catch {
      throw new NotFoundException();
    }

    return recipe;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });
    try {
      if (user.id != recipe.authorId && user.role != 'ADMIN') {
        throw new ForbiddenException();
      }
      await this.prisma.recipe.delete({
        where: { id: recipeId },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}
