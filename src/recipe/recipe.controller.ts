import { 
    Body,
    Controller,
    HttpCode,
    Param,
    Post,
    UseGuards,
    Get,
    ParseIntPipe
} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeRequest, CreateRecipeResponse, FetchRecipeResponse } from './dto';
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
  async fetchRecipe(@Param('id', ParseIntPipe) id: number): Promise<FetchRecipeResponse> {
      const fetchedRecipe = await this.recipeService.fetchRecipe(id)

      return FetchRecipeResponse.from(fetchedRecipe);
  }
}
