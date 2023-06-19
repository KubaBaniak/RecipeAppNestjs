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

<<<<<<< HEAD
  public static from(fetchedRecipes: Recipe[]): FetchRecipesResponse {
=======
  public static from(fetchedRecipes: IFetchedRecipes[]): FetchRecipesResponse {
>>>>>>> main
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
