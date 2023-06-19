interface IFetchedRecipes {
  id: number;
  createdAt: Date;
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
}

export class FetchRecipesResponse {
  constructor(public fetchedRecipes: IFetchedRecipes[]) {}

  public static from(fetchedRecipes: IFetchedRecipes[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
