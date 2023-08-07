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
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
  UploadedFiles,
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
  ApiUnprocessableEntityResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from '../common/decorators/req-user-id.decorator';
import { UploadImagesResponse } from './dto/upload-images-response';
import { S3_CONFIG } from './s3-config';

@Controller('recipes')
@ApiTags('Recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of all recipes' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiQuery({
    name: 'authorId',
    description:
      'Fetch all recipes that you have access to of user with such ID',
  })
  @Get()
  async fetchRecipes(
    @UserId() userId: number,
    @Query('authorId') authorId?: number,
  ): Promise<FetchRecipesResponse> {
    if (authorId) {
      const fetchedRecipes = await this.recipeService.fetchRecipesByAuthorId(
        authorId,
        userId,
      );
      return FetchRecipesResponse.from(fetchedRecipes);
    }
    const fetchedRecipes = await this.recipeService.fetchAllRecipes(userId);
    return FetchRecipesResponse.from(fetchedRecipes);
  }

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

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload image(s) of recipe' })
  @ApiBearerAuth()
  @ApiNotFoundResponse({ description: 'Recipe does not exist' })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiUnprocessableEntityResponse({ description: 'Wrong image format' })
  @ApiParam({
    name: 'id',
    description: 'Positive integer (≥1) to upload image(s) to specified recipe',
  })
  @Post('upload/:id')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) recipeId: number,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: S3_CONFIG.MAX_IMAGE_SIZE_IN_KB,
        })
        .addFileTypeValidator({
          fileType: S3_CONFIG.FILE_FORMAT,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Array<Express.Multer.File>,
  ): Promise<UploadImagesResponse> {
    const urls = await this.recipeService.uploadImages(userId, recipeId, files);

    return UploadImagesResponse.from(urls);
  }
}
