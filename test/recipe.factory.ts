import { faker } from '@faker-js/faker';

type CreateRecipeOverrides = {
  title?: string;
  description?: string;
  ingredients?: string;
  preparation?: string;
};

export const createRecipe = (overrides: CreateRecipeOverrides = {}) => ({
  title: overrides.title ?? faker.word.noun(5),
  description: overrides.description ?? faker.lorem.text(),
  ingredients: overrides.ingredients ?? faker.lorem.word(8),
  preparation: overrides.preparation ?? faker.lorem.lines(4),
});
