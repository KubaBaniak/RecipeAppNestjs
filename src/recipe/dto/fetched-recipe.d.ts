export type FetchedRecipe = {
  id: number;
  createdAt: Date;
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
  isPublic: boolean;
  authorId: number;
};
