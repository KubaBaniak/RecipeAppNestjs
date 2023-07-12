import { Recipe } from '@prisma/client';

export class UpdatedRecipeResponse {
  public id: number;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;
  public isPublic: boolean;
  public authorId: number;

  constructor(
    id: number,
    title: string,
    description: string,
    ingredients: string,
    preparation: string,
    isPublic: boolean,
    authorId: number,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.preparation = preparation;
    this.isPublic = isPublic;
    this.authorId = authorId;
  }

  public static from(updatedRecipe: Recipe): UpdatedRecipeResponse {
    return new UpdatedRecipeResponse(
      updatedRecipe.id,
      updatedRecipe.title,
      updatedRecipe.description,
      updatedRecipe.ingredients,
      updatedRecipe.preparation,
      updatedRecipe.isPublic,
      updatedRecipe.authorId,
    );
  }
}
