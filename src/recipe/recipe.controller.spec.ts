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
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
      };

      //when
      const createdRecipe = await recipeController.createRecipe(
        userObjectId,
        request,
      );

      //then
      expect(createdRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        ...request,
        authorId: userObjectId.user.id,
      });
    });
  });

  describe('FetchRecipe', () => {
    it('should fetch recipe given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };

      //when
      const fetchedRecipe = await recipeController.fetchRecipe(
        userObjectId,
        recipeId,
      );

      //then
      expect(fetchedRecipe).toEqual({
        fetchedRecipe: {
          id: recipeId,
          createdAt: expect.any(Date),
          title: expect.any(String),
          description: expect.any(String),
          ingredients: expect.any(String),
          preparation: expect.any(String),
          isPublic: true,
          authorId: userObjectId.user.id,
        },
      });
    });
    it('should fetch all users recipe recipes', async () => {
      //given
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };
      const email = faker.internet.password();

      //when
      const fetchedUsersRecipes = await recipeController.fetchUsersRecipes(
        userObjectId,
        email,
      );

      //then
      expect(fetchedUsersRecipes.fetchedRecipes).toEqual(
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
    it('should fetch all recipes', async () => {
      //given
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };

      //when
      const fetchedAllRecipes = await recipeController.fetchRecipes(
        userObjectId,
      );

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
            isPublic: true,
            authorId: expect.any(Number),
          },
        ]),
      );
    });
  });

  describe('UpdateRecipe', () => {
    it('should update recipe with given credentials', async () => {
      //given
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };
      const recipeId = faker.number.int();
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
      };

      //when
      const updatedRecipe = await recipeController.updateRecipe(
        recipeId,
        userObjectId,
        request,
      );

      //then
      expect(updatedRecipe).toEqual({
        id: recipeId,
        ...request,
        authorId: userObjectId.user.id,
      });
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe with given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userObjectId: { user: { id: number } } = {
        user: { id: faker.number.int() },
      };

      //when
      const deletedRecipe = await recipeController.deleteRecipe(
        userObjectId,
        recipeId,
      );

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
