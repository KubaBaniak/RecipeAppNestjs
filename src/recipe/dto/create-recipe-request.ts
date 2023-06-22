import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecipeRequest {
  @ApiProperty({
    description: 'Title of recipe',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of recipe',
  })
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'ingredients of recipe, each ingredient should in new line',
  })
  @IsNotEmpty()
  ingredients: string;

  @ApiProperty({
    description: 'Preparation of recipe, each step should in new line',
  })
  @IsNotEmpty()
  preparation: string;
}
