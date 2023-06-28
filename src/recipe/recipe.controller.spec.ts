import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { mockRecipeController } from './__mocks__/recipe.controller';

describe('RecipeController', () => {
  let recipeController: RecipeController;

  const mockRecipe = {
    id: expect.any(Number),
    createdAt: expect.any(Number),
    title: expect.any(String),
    description: expect.any(String),
    ingredients: expect.any(String),
    preparation: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useClass: mockRecipeController,
        },
        PrismaService,
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
        ...mockRecipe,
      });
    });
  });
  describe('FetchRecipe', () => {
    it('should fetch recipe given id', async () => {
      //given
      const id = 1;

      //when
      const fetchedRecipe = await recipeController.fetchRecipe(id);

      //then
      expect(fetchedRecipe).toEqual({
        fetchedRecipe: {
          ...mockRecipe,
        },
      });
    });
    it('should fetch all recipes', async () => {
      //when
      const fetchedAllRecipes = await recipeController.fetchRecipes();

      //then
      expect(fetchedAllRecipes.fetchedRecipes).toEqual(
        expect.arrayContaining([mockRecipe]),
      );
    });
  });
  describe('UpdateRecipe', () => {
    it('should update recipe with given credentials', async () => {
      //given
      const id = 1;
      const request = {
        title: faker.word.noun(),
        description: faker.lorem.text(),
        ingredients: faker.lorem.words(4),
        preparation: faker.lorem.lines(5),
      };

      //when
      const updatedRecipe = await recipeController.updateRecipe(id, request);

      //then
      expect(updatedRecipe).toEqual(mockRecipe);
    });
  });
  describe('DeleteRecipe', () => {
    it('should delete recipe with given id', async () => {
      //given
      const id = 1;

      //when
      const deletedRecipe = await recipeController.deleteRecipe(id);

      //then
      expect(deletedRecipe).toBeUndefined();
    });
  });
});
