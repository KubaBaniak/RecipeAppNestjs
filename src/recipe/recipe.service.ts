import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe, Prisma } from '@prisma/client';
import { UpdateRecipeRequest } from './dto';
import { RecipeCacheService } from './recipe.cache.service';

@Injectable()
export class RecipeService {
  constructor(
    private prisma: PrismaService,
    private readonly recipeCacheService: RecipeCacheService,
  ) {}

  async createRecipe(data: Prisma.RecipeCreateInput): Promise<Recipe> {
    const recipe = await this.prisma.recipe.create({
      data,
    });
    this.recipeCacheService.cacheRecipe(recipe);

    return recipe;
  }

  async fetchRecipe(id: number): Promise<Recipe> {
    let recipe: Recipe = await this.recipeCacheService.getCachedRecipe(id);

    if (!recipe) {
      recipe = await this.prisma.recipe.findUnique({
        where: {
          id,
        },
      });
    }

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
      this.recipeCacheService.cacheRecipe(recipe);
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
      this.recipeCacheService.deleteCachedRecipe(id);
    } catch {
      throw new NotFoundException();
    }
  }
}
