import { Body, Controller, HttpCode, Post, Get, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeRequest, CreateRecipeResponse, FetchAllRecipesResponse } from './dto';

import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeRequest, CreateRecipeResponse } from './dto';

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
  @Get()
  async fetchAllRecipes(): Promise<FetchAllRecipesResponse> {
    const fetchedRecipes = await this.recipeService.fetchAllRecipes()

    return FetchAllRecipesResponse.from(fetchedRecipes)
  }
}
