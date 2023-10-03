import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { RecipeModule } from '../src/recipe/recipe.module';
import { RecipeService } from '../src/recipe/recipe.service';
import { faker } from '@faker-js/faker';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import { createUser } from '../src/user/test/user.factory';
import { createRecipe } from '../src/recipe/test/recipe.factory';
import { Recipe, User } from '@prisma/client';
import { RedisCacheModule } from '../src/cache/redis-cache.module';
import { RecipeCacheService } from '../src/recipe/recipe.cache.service';
import { RecipeRepository } from '../src/recipe/recipe.repository';
import { UserRepository } from '../src/user/user.repository';
import { S3Service } from '../src/recipe/s3-bucket.service';
import { WebSocketEventGateway } from '../src/websocket/websocket-event.gateway';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from '../src/webhook/webhook.service';
import { WebhookRepository } from '../src/webhook/webhook.repository';
import { CryptoUtils } from '../src/webhook/utils/crypt-webhook-token';
import { PersonalAccessTokenRepository } from '../src/auth/personal-access-token.repository';
import { TwoFactorAuthRepository } from '../src/auth/twoFactorAuth.repository';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let user: User;
  let accessToken: string;
  let personalAccessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecipeModule, AuthModule, RedisCacheModule, HttpModule],
      providers: [
        RecipeService,
        TwoFactorAuthRepository,
        UserRepository,
        PersonalAccessTokenRepository,
        RecipeRepository,
        PrismaService,
        RecipeCacheService,
        S3Service,
        WebSocketEventGateway,
        WebhookService,
        WebhookRepository,
        CryptoUtils,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);

    const tempUser = createUser();
    user = await prismaService.user.create({ data: tempUser });
    accessToken = await authService.signIn(tempUser);
    personalAccessToken = await authService.createPersonalAccessToken(user.id);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
  });

  describe('POST /recipes', () => {
    it('should create recipe and return it', async () => {
      const recipe = createRecipe();
      return request(app.getHttpServer())
        .post('/recipes')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(recipe)
        .expect((response: request.Response) => {
          console.log(response.body);
          const {
            id,
            createdAt,
            title,
            description,
            ingredients,
            preparation,
            isPublic,
          } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(createdAt).toEqual(expect.any(String));
          expect(title).toEqual(recipe.title);
          expect(description).toEqual(recipe.description);
          expect(ingredients).toEqual(recipe.ingredients);
          expect(preparation).toEqual(recipe.preparation);
          expect(isPublic).toEqual(recipe.isPublic);
        })
        .expect(HttpStatus.CREATED);
    });

    it('should not create new recipe and return 400 error (BAD REQUEST)', async () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({})
        .expect((response: request.Response) => {
          console.log(response.body);
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not create new recipe and return 401 error (UNAUTHORIZED)', () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .send(createRecipe())
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /recipes/:id', () => {
    let recipe: Recipe;

    beforeEach(async () => {
      recipe = await prismaService.recipe.create({
        data: {
          ...createRecipe(),
          authorId: user.id,
        },
      });
    });

    it('should find specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          const {
            id,
            createdAt,
            title,
            description,
            ingredients,
            preparation,
            isPublic,
            authorId,
          } = response.body.fetchedRecipe;
          expect(id).toEqual(recipe.id);
          expect(createdAt).toEqual(expect.any(String));
          expect(title).toEqual(recipe.title);
          expect(description).toEqual(recipe.description);
          expect(ingredients).toEqual(recipe.ingredients);
          expect(preparation).toEqual(recipe.preparation);
          expect(isPublic).toEqual(recipe.isPublic);
          expect(authorId).toEqual(user.id);
        })
        .expect(HttpStatus.OK);
    });

    it('should fetch recipe using PAT', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id}`)
        .set({ Authorization: `Bearer ${personalAccessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.fetchedRecipe).toBeDefined();
        })
        .expect(HttpStatus.OK);
    });

    it('should not find recipe and return 404 error (NOT FOUND)', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id + 1}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not find specific recipe and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /recipes', () => {
    it('should find all recipes and check if it has all fields', async () => {
      await prismaService.recipe.create({
        data: {
          ...createRecipe({ isPublic: true }),
          authorId: user.id,
        },
      });
      return request(app.getHttpServer())
        .get(`/recipes`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.fetchedRecipes).toEqual(
            expect.arrayContaining([
              {
                id: expect.any(Number),
                createdAt: expect.any(String),
                title: expect.any(String),
                description: expect.any(String),
                ingredients: expect.any(String),
                preparation: expect.any(String),
                isPublic: expect.any(Boolean),
                authorId: expect.any(Number),
                imageUrls: [],
              },
            ]),
          );
        })
        .expect(HttpStatus.OK);
    });
    it('should find all recipes', async () => {
      const data = createRecipe();
      await prismaService.recipe.createMany({
        data: [
          { ...data, isPublic: true, authorId: user.id },
          { ...data, isPublic: true, authorId: user.id },
          { ...data, isPublic: true, authorId: user.id },
        ],
      });
      return request(app.getHttpServer())
        .get(`/recipes`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.fetchedRecipes).not.toHaveLength(0);
        })
        .expect(HttpStatus.OK);
    });

    it('should fetch all recipes using PAT', async () => {
      return request(app.getHttpServer())
        .get(`/recipes`)
        .set({ Authorization: `Bearer ${personalAccessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.fetchedRecipes).toBeDefined();
        })
        .expect(HttpStatus.OK);
    });

    it('should find all users recipes based on visibility', async () => {
      const otherUser = await prismaService.user.create({
        data: createUser(),
      });
      await prismaService.recipe.createMany({
        data: [
          { ...createRecipe(), authorId: user.id },
          { ...createRecipe({ isPublic: false }), authorId: user.id },
          { ...createRecipe(), authorId: otherUser.id },
          { ...createRecipe({ isPublic: false }), authorId: otherUser.id },
        ],
      });
      request(app.getHttpServer())
        .get(`/recipes`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.fetchedRecipes).toEqual(
            expect.arrayContaining([
              {
                isPublic: true,
                authorId: otherUser.id,
              },
              {
                isPublic: expect.any(Boolean),
                authorId: user.id,
              },
            ]),
          );
          expect(response.body.fetchedRecipes).toHaveLength(3);
        })
        .expect(HttpStatus.OK);

      await prismaService.recipe.deleteMany({
        where: {
          authorId: otherUser.id,
        },
      });
      await prismaService.user.delete({
        where: {
          id: otherUser.id,
        },
      });
    });

    it('should not find all recipes and return 401 error (UNAUTHORIZED)', () => {
      return request(app.getHttpServer())
        .get(`/recipes`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /recipes/:id', () => {
    let recipe: Recipe;
    const requestData = {
      title: faker.word.noun(5),
      description: faker.lorem.text(),
      ingredients: faker.lorem.word(8),
      preparation: faker.lorem.lines(4),
      isPublic: true,
    };

    beforeEach(async () => {
      recipe = await prismaService.recipe.create({
        data: {
          ...createRecipe(),
          authorId: user.id,
        },
      });
    });

    it('should update specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .patch(`/recipes/${recipe.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(requestData)
        .expect((response: request.Response) => {
          const { title, description, ingredients, preparation, isPublic } =
            response.body;
          expect(title).toEqual(requestData.title);
          expect(description).toEqual(requestData.description);
          expect(ingredients).toEqual(requestData.ingredients);
          expect(preparation).toEqual(requestData.preparation);
          expect(isPublic).toEqual(requestData.isPublic);
        })
        .expect(HttpStatus.OK);
    });

    it('should not update recipe and return 404 error (NOT FOUND)', async () => {
      return request(app.getHttpServer())
        .patch(`/recipes/${recipe.id + 999}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(requestData)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not update specific recipe and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .patch(`/recipes/${recipe.id}`)
        .send(requestData)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /recipes/:id', () => {
    let recipe: Recipe;

    beforeEach(async () => {
      recipe = await prismaService.recipe.create({
        data: {
          ...createRecipe(),
          authorId: user.id,
        },
      });
    });

    it('should delete specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .delete(`/recipes/${recipe.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HttpStatus.OK);
    });

    it('should not delete recipe and return 404 error (NOT FOUND)', async () => {
      return request(app.getHttpServer())
        .delete(`/recipes/${recipe.id + 999}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not delete specific recipe and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .delete(`/recipes/${recipe.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await prismaService.recipe.deleteMany();
    await prismaService.personalAccessToken.deleteMany();
    await app.close();
  });
});
