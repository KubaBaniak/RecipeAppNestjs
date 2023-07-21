import { Injectable, NotFoundException } from '@nestjs/common';
import { Recipe, Prisma } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';
import { RecipeCacheService } from './recipe.cache.service';
import { RecipeRepository } from './recipe.repository';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeCacheService: RecipeCacheService,
  ) {}

  async createRecipe(data: CreateRecipeRequest): Promise<Recipe> {
    const recipe = await this.recipeRepository.createRecipe(data);
    this.recipeCacheService.cacheRecipe(recipe);

    return recipe;
  }

  async fetchRecipe(id: number): Promise<Recipe> {
    let recipe: Recipe = await this.recipeCacheService.getCachedRecipe(id);

    if (!recipe) {
      recipe = await this.recipeRepository.getRecipeById(id);
    }

    if (!recipe) {
      throw new NotFoundException();
    }

    return recipe;
  }

  fetchAllRecipes(): Promise<Recipe[]> {
    return this.recipeRepository.getAllRecipes();
  }

  async updateRecipe(
    id: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    try {
      const recipe = await this.recipeRepository.updateRecipe(id, payload);
      this.recipeCacheService.cacheRecipe(recipe);
      return recipe;
    } catch {
      throw new NotFoundException();
    }
  }

  async deleteRecipe(id: number): Promise<void> {
    try {
      await this.recipeRepository.deleteRecipe(id);
      this.recipeCacheService.deleteCachedRecipe(id);
    } catch {
      throw new NotFoundException();
    }
  }
}
