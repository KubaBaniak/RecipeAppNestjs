import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Recipe } from '@prisma/client';

@Injectable()
export class RecipeCacheService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  private recipeCacheKey(recipeId: number): string {
    return `cache:recipe:${recipeId}`;
  }

  getCachedRecipe(id: number): Promise<Recipe> {
    return this.redisCacheService.get(this.recipeCacheKey(id));
  }

  cacheRecipe(recipe: Recipe): Promise<void> {
    return this.redisCacheService.set(this.recipeCacheKey(recipe.id), recipe);
  }

  deleteCachedRecipe(id: number): Promise<void> {
    return this.redisCacheService.del(this.recipeCacheKey(id));
  }
}
