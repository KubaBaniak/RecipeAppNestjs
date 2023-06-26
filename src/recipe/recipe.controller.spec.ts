import { Test, TestingModule } from '@nestjs/testing';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaService } from 'src/prisma/prisma.service';

describe("Recipe Controller's tests", () => {
    let recipeController: RecipeController;
    let recipeService: RecipeService;
    let prismaService: PrismaService;

    const mockRecipe = {
        id: expect.any(Number),
        createdAt: expect.any(Number),
        title: expect.any(String),
        description: expect.any(String),
        ingredients: expect.any(String),
        preparation: expect.any(String),
    };

    class mockRecipeRequest {
        title: string;
        description: string;
        ingredients: string;
        preparation: string;
    }

    const mockRecipeService = {
        createRecipe: jest.fn((dto: mockRecipeRequest) => {
            return {
                id: 1,
                createdAt: Date.now(),
                ...dto,
            };
        }),
        fetchRecipe: jest.fn((id: number) => {
            return {
                id,
                createdAt: Date.now(),
                title: 'Fetched recipe title',
                description: 'Fetched recipe description',
                ingredients: 'Fetched recipe ingredients',
                preparation: 'Fetched recipe preparation',
            };
        }),
        fetchAllRecipes: jest.fn(() => {
            return [
                {
                    id: 0,
                    createdAt: Date.now(),
                    title: 'Fetched recipe title',
                    description: 'Fetched recipe description',
                    ingredients: 'Fetched recipe ingredients',
                    preparation: 'Fetched recipe preparation',
                },
                {
                    id: 1,
                    createdAt: Date.now(),
                    title: 'Fetched recipe title',
                    description: 'Fetched recipe description',
                    ingredients: 'Fetched recipe ingredients',
                    preparation: 'Fetched recipe preparation',
                },
            ];
        }),
        updateRecipe: jest.fn((id: number, dto: mockRecipeRequest) => {
            return {
                id,
                createdAt: Date.now(),
                title: dto.title || 'latest title',
                description: dto.description || 'latest description',
                ingredients: dto.ingredients || 'latest ingredients',
                preparation: dto.preparation || 'latest preparation',
            };
        }),
        deleteRecipe: jest.fn((_id: number) => {
            return Promise<void>
        })
    };
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RecipeController],
            providers: [
                {
                    provide: RecipeService,
                    useValue: mockRecipeService,
                },
                PrismaService,
            ],
        }).compile();

        prismaService = module.get<PrismaService>(PrismaService);
        recipeService = module.get<RecipeService>(RecipeService);
        recipeController = module.get<RecipeController>(RecipeController);
    });

    it('should be defined', () => {
        expect(recipeController).toBeDefined();
    });

    describe('CreateRecipe', () => {
        it('should create recipe', async () => {
            //given
            const dto = {
                title: 'fries',
                description: '>>> mcdonalds',
                ingredients: 'potatoes',
                preparation: 'peel and fry',
            };

            //when
            const createdRecipe = await recipeController.createRecipe(dto);

            //then
            expect(createdRecipe).toEqual({
                ...mockRecipe,
            });
        });
    });
    describe('FetchRecipe', () => {
        it('should fetch recipe given id', async () => {
            //given
            const id = '1';

            //when
            const fetchedRecipe = await recipeController.fetchRecipe(+id);

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
            const id = '1';
            const dto = {
                title: 'updated title',
                description: 'updated description',
                ingredients: 'updated ingredients',
                preparation: 'updated preparation',
            };

            //when
            const updatedRecipe = await recipeController.updateRecipe(+id, dto);

            //then
            expect(updatedRecipe).toEqual(mockRecipe);
        });
    });
    describe('DeleteRecipe', () => {
        it('should delete recipe with given id', async () => {
            //given
            const id = '1';

            //when
            const deletedRecipe = await recipeController.deleteRecipe(+id);
            console.log(deletedRecipe);

            //then
            expect(deletedRecipe).toBeUndefined();
        });
    });
});
