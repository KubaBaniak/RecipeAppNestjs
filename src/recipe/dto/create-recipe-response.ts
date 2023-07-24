import { Recipe } from '@prisma/client';

export class CreateRecipeResponse {
  public id: number;
  public createdAt: Date;
  public title: string;
  public description: string;
  public ingredients: string;
  public preparation: string;
  public isPublic: boolean;
  public authorId: number;

  constructor(
    id: number,
    createdAt: Date,
    title: string,
    description: string,
    ingredients: string,
    preparation: string,
    isPublic: boolean,
    authorId: number,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.title = title;
    this.description = description;
    this.ingredients = ingredients;
    this.preparation = preparation;
    this.isPublic = isPublic;
    this.authorId = authorId;
  }

  public static from(createdRecipe: Recipe): CreateRecipeResponse {
    return new CreateRecipeResponse(
      createdRecipe.id,
      createdRecipe.createdAt,
      createdRecipe.title,
      createdRecipe.description,
      createdRecipe.ingredients,
      createdRecipe.preparation,
      createdRecipe.isPublic,
      createdRecipe.authorId,
    );
  }
}
