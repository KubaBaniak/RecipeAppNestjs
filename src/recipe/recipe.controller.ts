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

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @HttpCode(201)
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
  @Get(':id')
  async fetchRecipe(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FetchRecipeResponse> {
    const fetchedRecipe = await this.recipeService.fetchRecipe(id);

    return FetchRecipeResponse.from(fetchedRecipe);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async fetchRecipes(): Promise<FetchRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes();

    return FetchRecipesResponse.from(fetchedRecipes);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecipeRequest: UpdateRecipeRequest,
  ): Promise<UpdatedRecipeResponse> {
    const updatedRecipe = await this.recipeService.updateRecipe(
      id,
      updateRecipeRequest,
    );

    return UpdatedRecipeResponse.from(updatedRecipe);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteRecipe(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.recipeService.deleteRecipe(id);
  }
}
