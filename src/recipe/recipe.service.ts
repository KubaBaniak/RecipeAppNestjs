import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe, Role } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';
import { RecipeCacheService } from './recipe.cache.service';

@Injectable()
export class RecipeService {
  constructor(
    private prisma: PrismaService,
    private readonly recipeCacheService: RecipeCacheService,
  ) {}

  async createRecipe(
    data: CreateRecipeRequest,
    userId: number,
  ): Promise<Recipe> {
    const { title, description, ingredients, preparation, isPublic } = data;
    const recipe = await this.prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        preparation,
        isPublic,
        authorId: userId,
      },
    });
    this.recipeCacheService.cacheRecipe(recipe);

    return recipe;
  }

  async fetchRecipe(recipeId: number, userId: number): Promise<Recipe> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    let recipe: Recipe = await this.recipeCacheService.getCachedRecipe(
      recipeId,
    );
    if (!recipe) {
      recipe = await this.prisma.recipe.findUnique({
        where: {
          id: recipeId,
        },
      });
    }

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
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
    });
    if (!author) {
      throw new NotFoundException();
    }
    const principal = await this.prisma.user.findUnique({
      where: { id: principalId },
    });

    if (author.id === principal.id || principal.role == Role.ADMIN) {
      return this.prisma.recipe.findMany({
        where: {
          authorId: author.id,
        },
      });
    }

    return this.prisma.recipe.findMany({
      where: {
        authorId: author.id,
        isPublic: true,
      },
    });
  }

  async fetchAllRecipes(userId: number): Promise<Recipe[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (user.role === Role.ADMIN) {
      return this.prisma.recipe.findMany();
    } else {
      return this.prisma.recipe.findMany({
        where: {
          isPublic: true,
        },
      });
    }
  }

  async updateRecipe(
    userId: number,
    recipeId: number,
    payload: UpdateRecipeRequest,
  ): Promise<Recipe> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    let recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    try {
      if (user.id != recipe.authorId && user.role != Role.ADMIN) {
        throw new ForbiddenException();
      }

      recipe = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: payload,
      });
      this.recipeCacheService.cacheRecipe(recipe);
    } catch {
      throw new NotFoundException();
    }

    return recipe;
  }

  async deleteRecipe(recipeId: number, userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const recipe = await this.prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });
    try {
      if (user.id != recipe.authorId && user.role != Role.ADMIN) {
        throw new ForbiddenException();
      }
      await this.prisma.recipe.delete({
        where: { id: recipeId },
      });
      this.recipeCacheService.deleteCachedRecipe(recipeId);
    } catch {
      throw new NotFoundException();
    }
  }
}
