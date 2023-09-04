import { Recipe } from '@prisma/client';

export interface RecipeWithUrls extends Omit<Recipe, 'imageKeys'> {
  imageUrls: string[];
}
