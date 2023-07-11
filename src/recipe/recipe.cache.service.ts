import { Injectable } from '@nestjs/common';
import { RedisCacheService } from 'src/cache/redisCache.service';
import { Recipe } from '@prisma/client';

function recipeCacheKey(recipeId: number): string {
  return `cache:recipe:${recipeId}`;
}

@Injectable()
export class RecipeCacheService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  getCachedRecipe(id: number): Promise<Recipe> {
    return this.redisCacheService.get(recipeCacheKey(id));
  }

  cacheRecipe(recipe: Recipe): Promise<void> {
    return this.redisCacheService.set(recipeCacheKey(recipe.id), recipe);
  }

  deleteCacheRecipe(id: number): Promise<void> {
    return this.redisCacheService.del(recipeCacheKey(id));
  }
}
