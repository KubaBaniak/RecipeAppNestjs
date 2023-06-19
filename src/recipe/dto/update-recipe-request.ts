import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRecipeRequest {
  @IsOptional()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNotEmpty()
  ingredients: string;

  @IsOptional()
  @IsNotEmpty()
  preparation: string;
}
