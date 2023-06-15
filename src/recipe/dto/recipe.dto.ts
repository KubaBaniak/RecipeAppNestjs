import { Prisma, User } from '@prisma/client';
import { IsNotEmpty } from 'class-validator';

export class RecipeDto {
  @IsNotEmpty()
  title: string;

  description: string;

  @IsNotEmpty()
  ingredients: string;

  preparation: string;

  author: Prisma.UserCreateNestedOneWithoutRecipesInput;
}
