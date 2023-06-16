import { Recipe } from '@prisma/client';

export class CreateRecipeResponse {
  constructor(public createdRecipe: Recipe) {}

  public static from(createdRecipe: Recipe): CreateRecipeResponse {
    return new CreateRecipeResponse(createdRecipe);
  }
}
