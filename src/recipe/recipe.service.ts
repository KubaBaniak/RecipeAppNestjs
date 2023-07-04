import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Recipe, Prisma } from '@prisma/client';
import { UpdateRecipeRequest } from './dto';

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
