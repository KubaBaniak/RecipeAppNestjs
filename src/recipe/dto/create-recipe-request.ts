import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRecipeRequest {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Each ingredient should be in a new line',
    example: 'Item 1\nItem 2\nItem 3',
  })
  ingredients: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Each step should be in a new line',
    example: 'Step 1\nStep 2\nStep 3',
  })
  preparation: string;

  @ApiProperty({
    description: 'Sets recipe to public',
  })
  isPublic: boolean;
}
