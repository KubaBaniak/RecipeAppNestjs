import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecipeService } from './recipe.service';
import { faker } from '@faker-js/faker';

describe("Recipe Service's tests", () => {
  let recipeService: RecipeService;

  const mockRecipe = {
    id: expect.any(Number),
    createdAt: expect.any(Number),
    title: expect.any(String),
    description: expect.any(String),
    ingredients: expect.any(String),
    preparation: expect.any(String),
  };

  class MockRecipeRequest {
    data: {
      title: string;
      description: string;
      ingredients: string;
      preparation: string;
    };
  }

  const mockPrismaService = {
    recipe: {
      create: jest.fn().mockImplementation((request: MockRecipeRequest) => {
        return Promise.resolve({
          id: 420,
          createdAt: Date.now(),
          ...request.data,
        });
      }),

      findUnique: jest
        .fn()
        .mockImplementation((request: { where: { id: number } }) => {
          return Promise.resolve({
            id: request.where.id,
            createdAt: Date.now(),
            title: faker.word.noun(),
            description: faker.lorem.text(),
            ingredients: faker.lorem.words(4),
            preparation: faker.lorem.lines(5),
          });
        }),

      findMany: jest.fn().mockImplementation(() => {
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
      }),

      update: jest
        .fn()
        .mockImplementation(
          (request: { where: { id: number }; data: MockRecipeRequest }) => {
            return Promise.resolve({
              id: request.where.id,
              createdAt: Date.now(),
              ...request.data,
            });
          },
        ),

      delete: jest.fn().mockImplementation((_request) => {
        return Promise.resolve();
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    recipeService = module.get<RecipeService>(RecipeService);
  });

  it('should be defined', () => {
    expect(recipeService).toBeDefined();
  });

  describe('CreateRecipe', () => {
    it('should create recipe', async () => {
      //given
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.word(5),
        preparation: faker.lorem.lines(3),
      };

      //when
      const createdRecipe = await recipeService.createRecipe(request);

      //then
      expect(createdRecipe).toEqual(mockRecipe);
    });
  });

  describe('FetchRecipe', () => {
    it('should fetch recipe', async () => {
      //given
      const id = 777;

      //when
      const fetchedRecipe = await recipeService.fetchRecipe(id);

      //then
      expect(fetchedRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        ingredients: expect.any(String),
        preparation: expect.any(String),
      });
    });
  });

  describe('FetchAllRecipes', () => {
    it('should fetch all recipes', async () => {
      //given

      //when
      const fetchedAllRecipes = await recipeService.fetchAllRecipes();

      //then
      expect(fetchedAllRecipes).toEqual(expect.arrayContaining([mockRecipe]));
    });
  });

  describe('UpdateRecipe', () => {
    it('should update recipe by given id', async () => {
      //given
      const id = 11;
      const payload = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.word(5),
        preparation: faker.lorem.lines(3),
      };

      //when
      const updatedRecipe = await recipeService.updateRecipe(id, payload);

      //then
      expect(updatedRecipe).toEqual(mockRecipe);
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe by given id', async () => {
      //given
      const id = 37;

      //when
      const deletedRecipe = await recipeService.deleteRecipe(id);

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
