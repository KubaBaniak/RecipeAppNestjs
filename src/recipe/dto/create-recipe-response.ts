import { Recipe } from '@prisma/client';

export class CreateRecipeResponse {
  constructor(
    public id: number,
    public createdAt: Date,
    public title: string,
    public description: string,
    public ingredients: string,
    public preparation: string,
  ) {}

  public static from(createdRecipe: Recipe): CreateRecipeResponse {
    return new CreateRecipeResponse(
      createdRecipe.id,
      createdRecipe.createdAt,
      createdRecipe.title,
      createdRecipe.description,
      createdRecipe.ingredients,
      createdRecipe.preparation,
    );
  }
}
