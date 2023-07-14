import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RecipeService } from './recipe.service';
import { faker } from '@faker-js/faker';
import { MockPrismaService } from '../prisma/__mocks__/prisma.service.mock';

describe('RecipeService', () => {
  let recipeService: RecipeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: PrismaService,
          useClass: MockPrismaService,
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
      const userId: number = faker.number.int();
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.word(5),
        preparation: faker.lorem.lines(3),
        isPublic: true,
      };

      //when
      const createdRecipe = await recipeService.createRecipe(request, userId);

      //then
      expect(createdRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        ...request,
        authorId: userId,
      });
    });
  });

  describe('FetchRecipe', () => {
    it('should fetch recipe', async () => {
      //given
      const recipeId = faker.number.int();
      const userId = faker.number.int();

      //when
      const fetchedRecipe = await recipeService.fetchRecipe(recipeId, userId);

      //then
      expect(fetchedRecipe).toEqual({
        id: recipeId,
        createdAt: expect.any(Date),
        title: expect.any(String),
        description: expect.any(String),
        ingredients: expect.any(String),
        preparation: expect.any(String),
        isPublic: true,
        authorId: userId,
      });
    });
  });

  describe('FetchAllRecipes', () => {
    it('should fetch all recipes', async () => {
      //given
      const userId = faker.number.int();

      //when
      const fetchedAllRecipes = await recipeService.fetchAllRecipes(userId);

      //then
      expect(fetchedAllRecipes).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            title: expect.any(String),
            description: expect.any(String),
            ingredients: expect.any(String),
            preparation: expect.any(String),
            isPublic: true,
            authorId: expect.any(Number),
          },
        ]),
      );
    });
  });

  describe('UpdateRecipe', () => {
    it('should update recipe by given id', async () => {
      //given
      const userId = faker.number.int();
      const recipeId = faker.number.int();
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.word(5),
        preparation: faker.lorem.lines(3),
        isPublic: true,
      };

      //when
      const updatedRecipe = await recipeService.updateRecipe(
        userId,
        recipeId,
        request,
      );

      //then
      expect(updatedRecipe).toEqual({
        id: recipeId,
        createdAt: expect.any(Date),
        ...request,
        authorId: userId,
      });
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe by given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userId = faker.number.int();

      //when
      const deletedRecipe = await recipeService.deleteRecipe(userId, recipeId);

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
