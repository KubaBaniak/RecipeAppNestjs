interface IUpdatedRecipe {
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
}

export class UpdatedRecipeResponse {
  constructor(public updatedRecipes: IUpdatedRecipe) {}

  public static from(updatedRecipes: IUpdatedRecipe): UpdatedRecipeResponse {
    return new UpdatedRecipeResponse(updatedRecipes);
  }
}
