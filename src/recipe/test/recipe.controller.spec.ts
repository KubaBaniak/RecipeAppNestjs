import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from '../recipe.service';
import { RecipeController } from '../recipe.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { MockRecipeService } from '../__mocks__/recipe.service.mock';
import { RedisCacheModule } from '../../cache/redis-cache.module';
import { MockRecipeCacheService } from '../__mocks__/recipe.cache.mock';
import { RecipeCacheService } from '../recipe.cache.service';
import { S3Service } from '../s3-bucket.service';
import { RecipeRepository } from '../recipe.repository';
import { WebhookRepository } from '../../webhook/webhook.repository';
import { WebhookService } from '../../webhook/webhook.service';
import { HttpModule } from '@nestjs/axios';
import { CryptoUtils } from '../../webhook/utils/crypt-webhook-token';

describe('RecipeController', () => {
  let recipeController: RecipeController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisCacheModule, HttpModule],
      controllers: [RecipeController],
      providers: [
        PrismaService,
        S3Service,
        RecipeRepository,
        WebhookService,
        WebhookRepository,
        CryptoUtils,
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
      const userId = faker.number.int();
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
        isPublic: true,
        authorId: userId,
      };

      //when
      const createdRecipe = await recipeController.createRecipe(
        userId,
        request,
      );

      //then
      expect(createdRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        ...request,
      });
    });
  });

  describe('FindRecipe', () => {
    it('should fetch recipe given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userId = faker.number.int();

      //when
      const fetchedRecipe = await recipeController.fetchRecipe(
        userId,
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
          isPublic: false,
          authorId: userId,
          imageKeys: [],
        },
      });
    });
    it('should fetch all recipes', async () => {
      //given
      const userId = faker.number.int();

      //when
      const fetchedAllRecipes = await recipeController.fetchRecipes(userId);

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
            isPublic: false,
            authorId: expect.any(Number),
            imageKeys: [],
          },
        ]),
      );
    });
  });

  describe('UpdateRecipe', () => {
    it('should update recipe with given credentials', async () => {
      //given
      const userId = faker.number.int();
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
        userId,
        request,
      );

      //then
      expect(updatedRecipe).toEqual({
        id: recipeId,
        ...request,
        authorId: userId,
      });
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe with given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userId = faker.number.int();

      //when
      const deletedRecipe = await recipeController.deleteRecipe(
        userId,
        recipeId,
      );

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
