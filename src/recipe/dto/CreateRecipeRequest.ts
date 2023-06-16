import { IsNotEmpty } from 'class-validator';

export class CreateRecipeRequestDto {
  @IsNotEmpty()
  title: string;

  description: string;

  @IsNotEmpty()
  ingredients: string;

  preparation: string;
}
