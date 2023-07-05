import { faker } from '@faker-js/faker';

export const recipeData = {
  title: faker.word.noun(5),
  description: faker.lorem.text(),
  ingredients: faker.lorem.word(8),
  preparation: faker.lorem.lines(4),
};
