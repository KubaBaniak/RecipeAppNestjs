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
  Request,
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
    @Request() userIdObject: { user: { id: number } },
    @Body() createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = await this.recipeService.createRecipe(
      createRecipeRequest,
      userIdObject.user.id,
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
    @Request() userIdObject: { user: { id: number } },
    @Param('id', ParseIntPipe) recipeId: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = await this.recipeService.fetchRecipe(
      recipeId,
      userIdObject.user.id,
    );

    return FetchRecipeResponse.from(fetchedRecipe);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiParam({
    name: 'email',
    description: 'Email of a user',
  })
  @Get('/user/:email')
  async fetchUsersRecipes(
    @Request() userIdObject: { user: { id: number } },
    @Param('email') email: string,
  ): Promise<FetchRecipesResponse> {
    const fetchedUsersRecipes = await this.recipeService.fetchUsersRecipes(
      email,
      userIdObject.user.id,
    );

    return FetchRecipesResponse.from(fetchedUsersRecipes);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @Get()
  async fetchRecipes(
    @Request() userIdObject: { user: { id: number } },
  ): Promise<FetchRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes(
      userIdObject.user.id,
    );

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
    @Request() userIdObject: { user: { id: number } },
    @Body() updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    const updatedRecipe = await this.recipeService.updateRecipe(
      userIdObject.user.id,
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
    @Request() userIdObject: { user: { id: number } },
    @Param('id', ParseIntPipe) recipeId: number,
  ): Promise<void> {
    await this.recipeService.deleteRecipe(recipeId, userIdObject.user.id);
  }
}
