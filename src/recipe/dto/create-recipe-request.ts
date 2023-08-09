import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecipeRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Each ingredient should be in a new line',
    example: 'Item 1\nItem 2\nItem 3',
  })
  ingredients: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Each step should be in a new line',
    example: 'Step 1\nStep 2\nStep 3',
  })
  preparation: string;

  @ApiProperty({
    description: 'Sets recipe to public',
  })
  @IsBoolean()
  isPublic: boolean;
}
