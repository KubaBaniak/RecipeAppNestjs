import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
  Get,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import {
  CreateRecipeRequest,
  CreateRecipeResponse,
  FetchRecipeResponse,
  FetchRecipesResponse,
  UpdatedRecipeResponse,
  UpdateRecipeRequest,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { Recipe } from '@prisma/client';
import { RedisCacheService } from '../cache/redisCache.service';

@Controller('recipes')
@ApiTags('Recipes')
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create recipe' })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiUnauthorizedResponse({ description: 'User is unauthorized' })
  @Post()
  async createRecipe(
    @Body() createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = await this.recipeService.createRecipe(
      createRecipeRequest,
    );
    await this.redisCacheService.set(
      `cache:recipe:${createdRecipe.id}`,
      createdRecipe,
    );

    return CreateRecipeResponse.from(createdRecipe);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recipe' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'Recipe does not exist' })
  @ApiParam({
    name: 'id',
    description: 'Positive integer (≥1) to get recipe',
  })
  @Get(':id')
  async fetchRecipe(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FetchRecipeResponse> {
    let recipe: Recipe = await this.redisCacheService.get(`${id}`);

    if (!recipe) {
      recipe = await this.recipeService.fetchRecipe(id);
      await this.redisCacheService.set(`cache:recipe:${recipe.id}`, recipe);
    }
    return FetchRecipeResponse.from(recipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @Get()
  async fetchRecipes(): Promise<FetchRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes();

    return FetchRecipesResponse.from(fetchedRecipes);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update recipe' })
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Recipe does not exist' })
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiParam({
    name: 'id',
    description: 'Positive integer (≥1) to update recipe',
  })
  @Patch(':id')
  async updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    let recipe: Recipe = await this.redisCacheService.get(`${id}`);

    if (!recipe) {
      recipe = await this.recipeService.updateRecipe(id, updateRecipeRequest);
      await this.redisCacheService.del(`cache:recipe:${recipe.id}`);
    }

    return UpdatedRecipeResponse.from(recipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete recipe' })
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Recipe does not exist' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiParam({
    name: 'id',
    description: 'Positive integer (≥1) to delete recipe',
  })
  @Delete(':id')
  async deleteRecipe(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.recipeService.deleteRecipe(id);
    await this.redisCacheService.del(`cache:recipe:${id}`);
  }
}
