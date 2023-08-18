import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { RecipeService } from '../recipe.service';
import { faker } from '@faker-js/faker';
import { MockPrismaService } from '../../prisma/__mocks__/prisma.service.mock';
import { RecipeCacheService } from '../recipe.cache.service';
import { MockRecipeCacheService } from '../__mocks__/recipe.cache.mock';
import { RecipeRepository } from '../recipe.repository';
import { UserRepository } from '../../user/user.repository';
import { S3Service } from '../s3-bucket.service';
import { WebSocketEventGateway } from '../../websocket/websocket-event.gateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { WebhookRepository } from '../../webhook/webhook.repository';
import { WebhookService } from '../../webhook/webhook.service';
import { HttpModule } from '@nestjs/axios';

describe('RecipeService', () => {
  let recipeService: RecipeService;
  let webSocketEventGateway: WebSocketEventGateway;
  let webhookService: WebhookService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        RecipeService,
        S3Service,
        RecipeRepository,
        UserRepository,
        WebSocketEventGateway,
        AuthService,
        JwtService,
        WebhookService,
        WebhookRepository,
        {
          provide: PrismaService,
          useClass: MockPrismaService,
        },
        {
          provide: RecipeCacheService,
          useClass: MockRecipeCacheService,
        },
      ],
    }).compile();

    webSocketEventGateway = module.get<WebSocketEventGateway>(
      WebSocketEventGateway,
    );
    webhookService = module.get<WebhookService>(WebhookService);
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
        authorId: userId,
      };
      jest
        .spyOn(webSocketEventGateway, 'newRecipeEvent')
        .mockImplementationOnce(() => ({}));
      jest
        .spyOn(webhookService, 'sendWebhookEvent')
        .mockImplementationOnce(() => Promise.resolve());

      //when
      const createdRecipe = await recipeService.createRecipe(userId, request);

      //then
      expect(createdRecipe).toEqual({
        id: expect.any(Number),
        createdAt: expect.any(Date),
        ...request,
        authorId: userId,
        imageKeys: [],
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
        imageKeys: [],
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
            imageKeys: [],
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
      jest
        .spyOn(webhookService, 'sendWebhookEvent')
        .mockImplementationOnce(() => Promise.resolve());

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
        imageKeys: [],
      });
    });
  });

  describe('DeleteRecipe', () => {
    it('should delete recipe by given id', async () => {
      //given
      const recipeId = faker.number.int();
      const userId = faker.number.int();
      jest
        .spyOn(webhookService, 'sendWebhookEvent')
        .mockImplementationOnce(() => Promise.resolve());

      //when
      const deletedRecipe = await recipeService.deleteRecipe(userId, recipeId);

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
