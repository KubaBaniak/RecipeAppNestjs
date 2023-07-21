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
  Query,
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
import { UserId } from '../common/decorators/req-user-id.decorator';

@Controller('recipes')
@ApiTags('Recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create recipe' })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiUnauthorizedResponse({ description: 'User is unauthorized' })
  @Post()
  async createRecipe(
    @UserId() userId: number,
    @Body() createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = await this.recipeService.createRecipe(
      userId,
      createRecipeRequest,
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
    @UserId() userId: number,
    @Param('id', ParseIntPipe) recipeId: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = await this.recipeService.fetchRecipe(
      recipeId,
      userId,
    );

    return FetchRecipeResponse.from(fetchedRecipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @Get()
  async fetchRecipes(
    @UserId() userId: number,
    @Query('authorId') authorId?: string,
  ): Promise<FetchRecipesResponse> {
    console.log(authorId);
    if (authorId) {
      const fetchedRecipes = await this.recipeService.fetchRecipesByAuthorId(
        +authorId,
        userId,
      );
      return FetchRecipesResponse.from(fetchedRecipes);
    }
    const fetchedRecipes = await this.recipeService.fetchAllRecipes(userId);
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
    @Param('id', ParseIntPipe) recipeId: number,
    @UserId() userId: number,
    @Body() updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    const updatedRecipe = await this.recipeService.updateRecipe(
      userId,
      recipeId,
      updateRecipeRequest,
    );
    return UpdatedRecipeResponse.from(updatedRecipe);
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
  async deleteRecipe(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) recipeId: number,
  ): Promise<void> {
    await this.recipeService.deleteRecipe(recipeId, userId);
  }
}
