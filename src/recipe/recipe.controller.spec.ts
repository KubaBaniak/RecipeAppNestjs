import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { MockRecipeService } from './__mocks__/recipe.service.mock';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { MockRecipeCacheService } from './__mocks__/recipe.cache.mock';
import { RecipeCacheService } from './recipe.cache.service';

describe('RecipeController', () => {
  let recipeController: RecipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisCacheModule],
      controllers: [RecipeController],
      providers: [
        PrismaService,
        {
          provide: RecipeCacheService,
          useClass: MockRecipeCacheService,
        },
        {
          provide: RecipeService,
          useClass: MockRecipeService,
        },
      ],
    }).compile();

    recipeController = module.get<RecipeController>(RecipeController);
  });

  it('should be defined', () => {
    expect(recipeController).toBeDefined();
  });

  describe('CreateRecipe', () => {
    it('should create recipe', async () => {
      //given
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      };

      //when
      const createdRecipe = await recipeController.createRecipe(request);

      //then
      expect(createdRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        ...request,
      });
    });
  });

  describe('FetchRecipe', () => {
    it('should fetch recipe given id', async () => {
      //given
      const id = faker.number.int();

      //when
      const fetchedRecipe = await recipeController.fetchRecipe(id);

      //then
      expect(fetchedRecipe).toEqual({
        fetchedRecipe: {
          id,
          createdAt: expect.any(Date),
          title: expect.any(String),
          description: expect.any(String),
          ingredients: expect.any(String),
          preparation: expect.any(String),
        },
      });
    });
    it('should fetch all recipes', async () => {
      //when
      const fetchedAllRecipes = await recipeController.fetchRecipes();

      //then
      expect(fetchedAllRecipes.fetchedRecipes).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            createdAt: expect.any(Date),
            title: expect.any(String),
            description: expect.any(String),
            ingredients: expect.any(String),
            preparation: expect.any(String),
          },
        ]),
      );
    });
  });

  describe('UpdateRecipe', () => {
    it('should update recipe with given credentials', async () => {
      //given
      const id = faker.number.int();
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      };

      //when
      const updatedRecipe = await recipeController.updateRecipe(id, request);

      //then
      expect(updatedRecipe).toEqual({
        ...request,
      });
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe with given id', async () => {
      //given
      const id = faker.number.int();

      //when
      const deletedRecipe = await recipeController.deleteRecipe(id);

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
