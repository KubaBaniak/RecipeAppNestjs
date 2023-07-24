import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRecipeRequest {
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  ingredients?: string;

  @IsOptional()
  preparation?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
