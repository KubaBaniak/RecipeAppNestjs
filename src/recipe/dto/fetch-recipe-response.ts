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

export class FetchRecipeResponse {
  public fetchedRecipe: FetchedRecipe;

  constructor(fetchedRecipe: FetchedRecipe) {
    this.fetchedRecipe = fetchedRecipe;
  }

  public static from(fetchedRecipe: RecipeWithUrls): FetchRecipeResponse {
    return new FetchRecipeResponse(fetchedRecipe);
  }
}
