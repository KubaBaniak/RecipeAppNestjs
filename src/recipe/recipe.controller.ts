import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeDto } from './dto';

@Controller('recipe')
export class RecipeController {
  constructor(private recipeService: RecipeService) {}

  @HttpCode(201)
  @Post()
  async createRecipe(@Body() dto: RecipeDto) {
    return this.recipeService.createRecipe(dto);
  }
}
