import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecipeRequest {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  ingredients: string;

  @IsNotEmpty()
  preparation: string;
}
