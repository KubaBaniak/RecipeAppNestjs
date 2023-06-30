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

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtToken: string;
  let recipeId: number;

  const createRecipeRequest = {
    title: faker.word.noun(5),
    description: faker.lorem.text(),
    ingredients: faker.lorem.word(8),
    preparation: faker.lorem.lines(4),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecipeModule, AuthModule],
      providers: [RecipeService, PrismaService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtToken = await authService.signIn({
      email: 'test@gmail.com',
      password: 'testpassword123',
    });
    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
  });

  describe('/recipes (POST)', () => {
    it('should create recipe and return in', async () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .set({ Authorization: `Bearer ${jwtToken}` })
        .send(createRecipeRequest)
        .expect((response: request.Response) => {
          const { id, title, description, ingredients, preparation } =
            response.body;
          recipeId = id;
          expect(id).toEqual(expect.any(Number));
          expect(title).toEqual(createRecipeRequest.title);
          expect(description).toEqual(createRecipeRequest.description);
          expect(ingredients).toEqual(createRecipeRequest.ingredients);
          expect(preparation).toEqual(createRecipeRequest.preparation);
        })
        .expect(HttpStatus.CREATED);
    });

    it('should not create new recipe and return 400 error (BAD REQUEST)', async () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .set({ Authorization: `Bearer ${jwtToken}` })
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not create new recipe and return 401 error (UNAUTHORIZED)', () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .send(createRecipeRequest)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/recipes/:id (GET)', () => {
    it('should fetch specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .get(`/recipes/${recipeId}`)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect((response: request.Response) => {
          const { id, title, description, ingredients, preparation } =
            response.body.fetchedRecipe;
          expect(id).toEqual(id);
          expect(title).toEqual(expect.any(String));
          expect(description).toEqual(expect.any(String));
          expect(ingredients).toEqual(expect.any(String));
          expect(preparation).toEqual(expect.any(String));
        })
        .expect(HttpStatus.OK);
    });

    it('should not fetch recipe and return 404 error (NOT FOUND)', async () => {
      const invalidId = -7;

      return request(app.getHttpServer())
        .get(`/recipes/${invalidId}`)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not fetch specific recipe and return 401 error (UNAUTHORIZED)', () => {
      const id = 1;

      return request(app.getHttpServer())
        .get(`/recipes/${id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/recipes (GET)', () => {
    it('should fetch all recipes', async () => {
      return request(app.getHttpServer())
        .get(`/recipes`)
        .set({ Authorization: `Bearer ${jwtToken}` })
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
              },
            ]),
          );
        })
        .expect(HttpStatus.OK);
    });

    it('should not fetch all recipes and return 401 error (UNAUTHORIZED)', () => {
      return request(app.getHttpServer())
        .get(`/recipes`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/recipe/:id (PATCH)', () => {
    const req = {
      title: faker.word.noun(5),
      description: faker.lorem.text(),
      ingredients: faker.lorem.word(8),
      preparation: faker.lorem.lines(4),
    };

    it('should update specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .patch(`/recipes/${recipeId}`)
        .send(req)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect((response: request.Response) => {
          const { id, title, description, ingredients, preparation } =
            response.body;
          expect(id).toEqual(id);
          expect(title).toEqual(req.title);
          expect(description).toEqual(req.description);
          expect(ingredients).toEqual(req.ingredients);
          expect(preparation).toEqual(req.preparation);
        })
        .expect(HttpStatus.OK);
    });

    it('should not update recipe and return 404 error (NOT FOUND)', async () => {
      const invalidId = -7;

      return request(app.getHttpServer())
        .patch(`/recipes/${invalidId}`)
        .send(req)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not update specific recipe and return 401 error (UNAUTHORIZED)', () => {
      const id = 1;
      return request(app.getHttpServer())
        .patch(`/recipes/${id}`)
        .send(req)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/recipes/:id (DELETE)', () => {
    it('should delete specific recipe by by given id', async () => {
      return request(app.getHttpServer())
        .delete(`/recipes/${recipeId}`)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect(HttpStatus.OK);
    });

    it('should not delete recipe and return 404 error (NOT FOUND)', async () => {
      const invalidId = -3;
      return request(app.getHttpServer())
        .delete(`/recipes/${invalidId}`)
        .set({ Authorization: `Bearer ${jwtToken}` })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not delete specific recipe and return 401 error (UNAUTHORIZED)', () => {
      const id = 1;
      return request(app.getHttpServer())
        .delete(`/recipes/${id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
