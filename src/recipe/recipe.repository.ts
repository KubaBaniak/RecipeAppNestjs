import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Recipe } from '@prisma/client';
import { CreateRecipeRequest, UpdateRecipeRequest } from './dto';

@Injectable()
export class RecipeRepository {
  constructor(private prisma: PrismaService) {}

  createRecipe(userId: number, data: CreateRecipeRequest): Promise<Recipe> {
    return this.prisma.recipe.create({
      data: {
        ...data,
        authorId: userId,
      },
    });
  }

  getRecipeById(id: number): Promise<Recipe> {
    return this.prisma.recipe.findUnique({
      where: {
        id,
      },
    });
  }

  getUsersRecipes(authorId: number): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: {
        authorId,
      },
    });
  }

  getUsersPublicRecipes(authorId: number): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: {
        authorId,
        isPublic: true,
      },
    });
  }

  addImageUrls(recipeId: number, keys: string[]): Promise<Recipe> {
    return this.prisma.recipe.update({
      where: {
        id: recipeId,
      },
      data: {
        imagesUrls: keys,
      },
    });
  }

  getAllRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany();
  }

  getAllPublicRecipes(): Promise<Recipe[]> {
    return this.prisma.recipe.findMany({
      where: {
        isPublic: true,
      },
    });
  }

  updateRecipe(id: number, payload: UpdateRecipeRequest): Promise<Recipe> {
    return this.prisma.recipe.update({
      where: { id },
      data: payload,
    });
  }

  deleteRecipe(id: number): Promise<Recipe> {
    return this.prisma.recipe.delete({
      where: { id },
    });
  }
}
