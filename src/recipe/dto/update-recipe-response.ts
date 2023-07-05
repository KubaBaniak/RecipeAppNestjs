import { Recipe } from '@prisma/client';

export class UpdatedRecipeResponse {
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;

  constructor(
    title: string,
    description: string,
    ingredients: string,
    preparation: string,
  ) {
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.preparation = preparation;
  }

  public static from(updatedRecipe: Recipe): UpdatedRecipeResponse {
    return new UpdatedRecipeResponse(
      updatedRecipe.title,
      updatedRecipe.description,
      updatedRecipe.ingredients,
      updatedRecipe.preparation,
    );
  }
}
