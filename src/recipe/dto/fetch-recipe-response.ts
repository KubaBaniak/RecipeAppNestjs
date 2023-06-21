import { Recipe } from '@prisma/client';

export class FetchRecipeResponse {
  constructor(
    public id: number,
    public createdAt: Date,
    public title: string,
    public description: string,
    public ingredients: string,
    public preparation: string,
  ) {}

  public static from(fetchedRecipe: Recipe): FetchRecipeResponse {
    return new FetchRecipeResponse(
      fetchedRecipe.id,
      fetchedRecipe.createdAt,
      fetchedRecipe.title,
      fetchedRecipe.description,
      fetchedRecipe.ingredients,
      fetchedRecipe.preparation,
    );
  }
}
