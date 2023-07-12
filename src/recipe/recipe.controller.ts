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
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Controller('recipes')
@ApiTags('Recipes')
export class RecipeController {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create recipe' })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Wrong credentials provided' })
  @ApiUnauthorizedResponse({ description: 'User is unauthorized' })
  @Post()
  async createRecipe(
    @Request() req: { userId: number },
    @Body() createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = await this.recipeService.createRecipe(
      createRecipeRequest,
      req.userId,
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
    @Request() req: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = await this.recipeService.fetchRecipe(id, req.userId);

    return FetchRecipeResponse.from(fetchedRecipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @Get()
  async fetchRecipes(
    @Request() req: { userId: number },
  ): Promise<FetchRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes(req.userId);

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
    @Request() req: { userId: number },
    @Body() updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    const updatedRecipe = await this.recipeService.updateRecipe(
      req.userId,
      id,
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
    @Request() req: { userId: number },
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.recipeService.deleteRecipe(id, req.userId);
  }
}
