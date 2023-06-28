import { faker } from '@faker-js/faker';
class mockRecipeRequest {
  title: string;
  description: string;
  ingredients: string;
  preparation: string;
}

export class mockRecipeController {
  public createRecipe(dto: mockRecipeRequest) {
    return Promise.resolve({
      id: 1,
      createdAt: Date.now(),
      ...dto,
    });
  }

  public fetchRecipe(id: number) {
    return Promise.resolve({
      id,
      createdAt: Date.now(),
      title: faker.word.noun(),
      description: faker.lorem.text(),
      ingredients: faker.lorem.words(4),
      preparation: faker.lorem.lines(5),
    });
  }

  public fetchAllRecipes() {
    return Promise.resolve([
      {
        id: 0,
        createdAt: Date.now(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      },
      {
        id: 1,
        createdAt: Date.now(),
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      },
    ]);
  }
  public updateRecipe(id: number, dto: mockRecipeRequest) {
    return Promise.resolve({
      id,
      createdAt: Date.now(),
      title: dto.title || faker.word.noun(),
      description: dto.description || faker.lorem.text(),
      ingredients: dto.ingredients || faker.lorem.words(4),
      preparation: dto.preparation || faker.lorem.lines(5),
    });
  }

  public deleteRecipe(_id: number) {
    Promise.resolve();
  }
}
