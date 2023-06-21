import { Recipe } from '@prisma/client';

export class FetchRecipeResponse {
  public id: number;
  public createdAt: Date;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;

  constructor(
    id: number,
    createdAt: Date,
    title: string,
    description: string,
    ingredients: string,
    preparation: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.preparation = preparation;
  }

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
