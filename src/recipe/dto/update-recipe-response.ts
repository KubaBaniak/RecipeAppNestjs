import { Recipe } from '@prisma/client';

export class UpdatedRecipeResponse {
  constructor(
    public id: number,
    public createdAt: Date,
    public title: string,
    public description: string,
    public ingredients: string,
    public preparation: string,
  ) {}

  public static from(updatedRecipe: Recipe): UpdatedRecipeResponse {
    return new UpdatedRecipeResponse(
      updatedRecipe.id,
      updatedRecipe.createdAt,
      updatedRecipe.title,
      updatedRecipe.description,
      updatedRecipe.ingredients,
      updatedRecipe.preparation,
    );
  }
}
