import { faker } from '@faker-js/faker';

type CreateRecipeOverrides = {
  title?: string;
  description?: string;
  ingredients?: string;
  preparation?: string;
  isPublic?: boolean;
};

export const createRecipe = (overrides: CreateRecipeOverrides = {}) => ({
  title: overrides.title ?? faker.word.noun(5),
  description: overrides.description ?? faker.lorem.text(),
  ingredients: overrides.ingredients ?? faker.lorem.word(8),
  preparation: overrides.preparation ?? faker.lorem.lines(4),
  isPublic: overrides.isPublic ?? true,
});

type CreateRecipeResponseOverrides = {
  id?: number;
  createdAt?: Date;
  title?: string;
  description?: string;
  ingredients?: string;
  preparation?: string;
  isPublic?: boolean;
  authorId?: number;
};

export const createRecipeResponse = (
  overrides: CreateRecipeResponseOverrides = {},
) => ({
  id: overrides.id ?? faker.number.int(),
  createdAt: overrides.createdAt ?? new Date(),
  title: overrides.title ?? faker.word.noun(5),
  description: overrides.description ?? faker.lorem.text(),
  ingredients: overrides.ingredients ?? faker.lorem.word(8),
  preparation: overrides.preparation ?? faker.lorem.lines(4),
  isPublic: overrides.isPublic ?? true,
  authorId: overrides.authorId ?? faker.number.int(),
});
