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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('recipe')
@ApiTags('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @HttpCode(201)
  @ApiOperation({ summary: 'Create recipe' })
  @Post()
  async createRecipe(
    @Body() createRecipeRequest: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const createdRecipe = await this.recipeService.createRecipe(
      createRecipeRequest,
    );
    return CreateRecipeResponse.from(createdRecipe);
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get recipe' })
  @Get(':id')
  async fetchRecipe(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = await this.recipeService.fetchRecipe(id);

    return FetchRecipeResponse.from(fetchedRecipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @Get()
  async fetchRecipes(): Promise<FetchRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes();

    return FetchRecipesResponse.from(fetchedRecipes);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update recipe' })
  @Patch(':id')
  async updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    const updatedRecipe = await this.recipeService.updateRecipe(id, payload);

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete recipe' })
  @Delete(':id')
  async deleteRecipe(@Param('id', ParseIntPipe) id: number) {
    await this.recipeService.deleteRecipe(id);
  }
}
