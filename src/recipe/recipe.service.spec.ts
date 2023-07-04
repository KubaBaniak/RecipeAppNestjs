import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
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
            const request = {
                title: faker.word.noun(),
                description: faker.lorem.text(),
                ingredients: faker.lorem.word(5),
                preparation: faker.lorem.lines(3),
            };

            //when
            const createdRecipe = await recipeService.createRecipe(request);

            //then
            expect(createdRecipe).toEqual({
                id: expect.any(Number),
                createdAt: expect.any(Date),
                ...request,
            });
        });
    });

    describe('FetchRecipe', () => {
        it('should fetch recipe', async () => {
            //given
            const id = faker.number.int();

            //when
            const fetchedRecipe = await recipeService.fetchRecipe(id);

            //then
            expect(fetchedRecipe).toEqual({
                id,
                createdAt: expect.any(Date),
                title: expect.any(String),
                description: expect.any(String),
                ingredients: expect.any(String),
                preparation: expect.any(String),
            });
        });
    });

    describe('FetchAllRecipes', () => {
        it('should fetch all recipes', async () => {
            //when
            const fetchedAllRecipes = await recipeService.fetchAllRecipes();

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
                    },
                ]),
            );
        });
    });

    describe('UpdateRecipe', () => {
        it('should update recipe by given id', async () => {
            //given
            const id = faker.number.int();
            const request = {
                title: faker.word.noun(),
                description: faker.lorem.text(),
                ingredients: faker.lorem.word(5),
                preparation: faker.lorem.lines(3),
            };

            //when
            const updatedRecipe = await recipeService.updateRecipe(id, request);

            //then
            expect(updatedRecipe).toEqual({
                id,
                createdAt: expect.any(Date),
                ...request,
            });
        });
    });

    describe('DeleteRecipe', () => {
        it('should delete recipe by given id', async () => {
            //given
            const id = faker.number.int();

            //when
            const deletedRecipe = await recipeService.deleteRecipe(id);

            //then
            expect(deletedRecipe).toBeUndefined();
        });
    });
});
