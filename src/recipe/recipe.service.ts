import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Recipe } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';
import { RecipeCacheService } from './recipe.cache.service';
import { RecipeRepository } from './recipe.repository';
import { UserRepository } from '../user/user.repository';
import { Role } from '@prisma/client';

@Injectable()
export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly userRepository: UserRepository,
    private readonly recipeCacheService: RecipeCacheService,
  ) {}

  async createRecipe(
    userId: number,
    data: CreateRecipeRequest,
  ): Promise<Recipe> {
    const recipe = await this.recipeRepository.createRecipe(userId, data);
    this.recipeCacheService.cacheRecipe(recipe);

    return recipe;
  }

  async fetchRecipe(recipeId: number, userId: number): Promise<Recipe> {
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

    return recipe;
  }

  async fetchRecipesByAuthorId(
    authorId: number,
    principalId: number,
  ): Promise<Recipe[]> {
    const author = await this.userRepository.getUserById(authorId);
    if (!author) {
      throw new NotFoundException();
    }
    const principal = await this.userRepository.getUserById(principalId);

    if (author.id === principal.id || principal.role == Role.ADMIN) {
      return this.recipeRepository.getUsersRecipes(authorId);
    }

    return this.recipeRepository.getUsersPublicRecipes(authorId);
  }

  async fetchAllRecipes(userId: number): Promise<Recipe[]> {
    const user = await this.userRepository.getUserById(userId);
    if (user.role === Role.ADMIN) {
      return this.recipeRepository.getAllRecipes();
    } else {
      return this.recipeRepository.getAllPublicRecipes();
    }
  }

  async updateRecipe(
    userId: number,
    recipeId: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    const user = await this.userRepository.getUserById(userId);
    let recipe = await this.recipeRepository.getRecipeById(recipeId);

    if (user.id != recipe.authorId && user.role != Role.ADMIN) {
      throw new ForbiddenException();
    }

    try {
      recipe = await this.recipeRepository.updateRecipe(recipeId, payload);
      this.recipeCacheService.cacheRecipe(recipe);
    } catch {
      throw new NotFoundException();
    }

    return recipe;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    const recipe = await this.recipeRepository.getRecipeById(recipeId);
    try {
      if (user.id != recipe.authorId && user.role != Role.ADMIN) {
        throw new ForbiddenException();
      }
      await this.recipeRepository.deleteRecipe(recipeId);
      this.recipeCacheService.deleteCachedRecipe(recipeId);
    } catch {
      throw new NotFoundException();
    }
  }
}
