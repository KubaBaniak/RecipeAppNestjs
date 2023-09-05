import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Recipe } from '@prisma/client';
import {
  CreateRecipeRequest,
  RecipeWithUrls,
  UpdateRecipeRequest,
} from './dto';
import { RecipeCacheService } from './recipe.cache.service';
import { RecipeRepository } from '../recipe/recipe.repository';
import { UserRepository } from '../user/user.repository';
import { Role } from '@prisma/client';
import { S3Service } from './s3-bucket.service';
import { WebSocketEventGateway } from '../websocket/websocket-event.gateway';
import { WebhookService } from '../webhook/webhook.service';
import { WebhookEventType } from '../webhook/dto';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly userRepository: UserRepository,
    private readonly recipeCacheService: RecipeCacheService,
    private readonly s3Service: S3Service,
    private readonly webSocketEventGateway: WebSocketEventGateway,
    private readonly webhookService: WebhookService,
  ) {}

  getPresignedUrlsForRecipeImages(recipe: Recipe): Promise<string[]> {
    return Promise.all(
      recipe.imageKeys.map((key) => this.s3Service.getPresignedUrl(key)),
    );
  }

  getImageUrlsOfManyRecipes(recipes: Recipe[]): Promise<RecipeWithUrls[]> {
    return Promise.all(
      recipes.map(async (recipe) => {
        const { imageKeys, ...recipeWithoutImageKeys } = recipe;
        return {
          ...recipeWithoutImageKeys,
          imageUrls: await this.getPresignedUrlsForRecipeImages(recipe),
        };
      }),
    );
  }

  async createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<Recipe> {
    const recipe = await this.recipeRepository.createRecipe(userId, data);
    this.recipeCacheService.cacheRecipe(recipe);
    this.webSocketEventGateway.newRecipeEvent(
      recipe.title,
      recipe.isPublic,
      recipe.authorId,
    );

    this.webhookService.createWebhookEvent(
      userId,
      recipe,
      WebhookEventType.RecipeCreated,
    );
    return recipe;
  }

  async fetchRecipe(recipeId: number, userId: number): Promise<RecipeWithUrls> {
    const user = await this.userRepository.getUserById(userId);
    const recipe =
      (await this.recipeCacheService.getCachedRecipe(recipeId)) ??
      (await this.recipeRepository.getRecipeById(recipeId));

    if (!recipe) {
      throw new NotFoundException();
    }

    if (
      user.id != recipe.authorId &&
      user.role != Role.ADMIN &&
      !recipe.isPublic
    ) {
      throw new ForbiddenException(
        `You do not have permission to access this recipe. 
         Ensure that you are logged in the correct account and have the necessary privileges to view this content.`,
      );
    }

    if (user.id != recipe.authorId && !recipe.isPublic) {
      throw new ForbiddenException();
    }
    const { imageKeys, ...recipeWithoutImageKeys } = recipe;

    return {
      ...recipeWithoutImageKeys,
      imageUrls: await this.getPresignedUrlsForRecipeImages(recipe),
    };
  }

  async fetchRecipesByAuthorId(
    authorId: number,
    principalId: number,
  ): Promise<RecipeWithUrls[]> {
    const author = await this.userRepository.getUserById(authorId);
    if (!author) {
      throw new NotFoundException();
    }
    const principal = await this.userRepository.getUserById(principalId);

    if (author.id === principal.id || principal.role == Role.ADMIN) {
      const recipes = await this.recipeRepository.getUsersRecipes(authorId);
      return this.getImageUrlsOfManyRecipes(recipes);
    }

    const recipes = await this.recipeRepository.getUsersPublicRecipes(authorId);
    return this.getImageUrlsOfManyRecipes(recipes);
  }

  async fetchAllRecipes(userId: number): Promise<RecipeWithUrls[]> {
    const user = await this.userRepository.getUserById(userId);
    if (user.role === Role.ADMIN) {
      const recipes = await this.recipeRepository.getAllRecipes();
      return this.getImageUrlsOfManyRecipes(recipes);
    } else {
      const recipes = await this.recipeRepository.getAllAvailableRecipesForUser(
        userId,
      );
      return this.getImageUrlsOfManyRecipes(recipes);
    }
  }

  async updateRecipe(
    userId: number,
    recipeId: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    const user = await this.userRepository.getUserById(userId);
    let recipe = await this.recipeRepository.getRecipeById(recipeId);
    if (!recipe) {
      throw new NotFoundException();
    }

    if (user.id != recipe.authorId && user.role != Role.ADMIN) {
      throw new ForbiddenException();
    }

    recipe = await this.recipeRepository.updateRecipe(recipeId, payload);

    this.recipeCacheService.cacheRecipe(recipe);
    this.webhookService.createWebhookEvent(
      userId,
      recipe,
      WebhookEventType.RecipeUpdated,
    );

    return recipe;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    const recipe = await this.recipeRepository.getRecipeById(recipeId);
    if (!recipe) {
      throw new NotFoundException();
    }
    if (user.id != recipe.authorId && user.role != Role.ADMIN) {
      throw new ForbiddenException();
    }
    await this.recipeRepository.deleteRecipe(recipeId);
    this.recipeCacheService.deleteCachedRecipe(recipeId);
    this.webhookService.createWebhookEvent(
      userId,
      recipe,
      WebhookEventType.RecipeDeleted,
    );
  }

  async uploadImages(
    userId: number,
    recipeId: number,
    files: Array<Express.Multer.File>,
  ): Promise<string[]> {
    const user = await this.userRepository.getUserById(userId);
    const recipe = await this.recipeRepository.getRecipeById(recipeId);

    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    if (user.id != recipe.authorId && user.role !== Role.ADMIN) {
      throw new ForbiddenException();
    }

    const keys = await Promise.all(
      files.map((file) => this.s3Service.uploadFile(file, userId, recipeId)),
    );
    await this.recipeRepository.addImageKeys(recipeId, keys);

    return Promise.all(keys.map((key) => this.s3Service.getPresignedUrl(key)));
  }
}
