import { RecipeCacheService } from '../recipe.cache.service';
import { Recipe } from '@prisma/client';

export class MockRecipeCacheService implements Required<RecipeCacheService> {
  getCachedRecipe(_id: number): Promise<any> {
    return Promise.resolve();
  }

  cacheRecipe(_recipe: Recipe): Promise<void> {
    return Promise.resolve();
  }

  deleteCachedRecipe(_id: number): Promise<void> {
    return Promise.resolve();
  }
}
