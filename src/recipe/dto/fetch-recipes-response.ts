import { RecipeWithUrls } from './recipe-with-urls';

interface FetchedRecipe {
  id: number;
  createdAt: Date;
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
  isPublic: boolean;
  authorId: number;
  imageUrls: string[];
}

export class FetchRecipesResponse {
  public fetchedRecipes: FetchedRecipe[];

  constructor(fetchedRecipes: FetchedRecipe[]) {
    this.fetchedRecipes = fetchedRecipes;
  }

  public static from(fetchedRecipes: RecipeWithUrls[]): FetchRecipesResponse {
    return new FetchRecipesResponse(fetchedRecipes);
  }
}
