import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { RecipeModule } from '../src/recipe/recipe.module';
import { RecipeService } from '../src/recipe/recipe.service';
import { faker } from '@faker-js/faker';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import { createUser } from './user.factory';
import { createRecipe } from './recipe.factory';
import { Recipe, User } from '@prisma/client';
import { RedisCacheModule } from '../src/cache/redis-cache.module';
import { RecipeCacheService } from '../src/recipe/recipe.cache.service';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecipeModule, AuthModule, RedisCacheModule],
      providers: [RecipeService, PrismaService, RecipeCacheService],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);

    user = await prismaService.user.create({
      data: createUser(),
    });
    accessToken = await authService.signIn({
      email: user.email,
      password: user.password,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await prismaService.recipe.deleteMany({});
  });

  describe('POST /recipes', () => {
    it('should create recipe and return in', async () => {
      const recipe = createRecipe();
      return request(app.getHttpServer())
        .post('/recipes')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(recipe)
        .expect((response: request.Response) => {
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

    it('should fetch specific recipe by by given id', async () => {
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

    it('should not fetch recipe and return 404 error (NOT FOUND)', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id + 1}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not fetch specific recipe and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipe.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /recipes/user/:email', () => {
    it('should fetch all users recipes', async () => {
      const userPublicRecipe = createRecipe();
      const userPrivateRecipe = createRecipe({ isPublic: false });
      const otherUser = await prismaService.user.create({
        data: createUser(),
      });
      const otherPublicRecipe = createRecipe();
      const otherPrivateRecipe = createRecipe({ isPublic: false });
      await prismaService.recipe.createMany({
        data: [
          { ...userPublicRecipe, authorId: user.id },
          { ...userPrivateRecipe, authorId: user.id },
          { ...otherPublicRecipe, authorId: otherUser.id },
          { ...otherPrivateRecipe, authorId: otherUser.id },
        ],
      });
      request(app.getHttpServer())
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
                isPublic: expect.any(true),
                authorId: expect.any(otherUser.id),
              },
              {
                id: expect.any(Number),
                createdAt: expect.any(String),
                title: expect.any(String),
                description: expect.any(String),
                ingredients: expect.any(String),
                preparation: expect.any(String),
                isPublic: expect.any(Boolean),
                authorId: expect.any(user.id),
              },
            ]),
          );
          expect(response.body.fetchedRecipes).toHaveLength(3);
        })
        .expect(HttpStatus.OK);

      prismaService.recipe.deleteMany({
        where: {
          authorId: otherUser.id,
        },
      });
      prismaService.user.delete({
        where: {
          id: otherUser.id,
        },
      });
    });
  });

  describe('GET /recipes', () => {
    it('should fetch all recipes', async () => {
      const data = createRecipe();
      await prismaService.recipe.createMany({
        data: [
          { ...data, authorId: user.id },
          { ...data, authorId: user.id },
          { ...data, authorId: user.id },
        ],
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
              },
            ]),
          );
          expect(response.body.fetchedRecipes).toHaveLength(3);
        })

        .expect(HttpStatus.OK);
    });

    it('should not fetch all recipes and return 401 error (UNAUTHORIZED)', () => {
      return request(app.getHttpServer())
        .get(`/recipes`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /recipe/:id', () => {
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
        .send(requestData)
        .set({ Authorization: `Bearer ${accessToken}` })
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
        .patch(`/recipes/${recipe.id + 1}`)
        .send(requestData)
        .set({ Authorization: `Bearer ${accessToken}` })
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
        .delete(`/recipes/${recipe.id + 1}`)
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
    await app.close();
    prismaService.user.delete({
      where: {
        id: user.id,
      },
    });
  });
});
