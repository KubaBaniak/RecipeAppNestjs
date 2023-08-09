import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeRequest {
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty()
  title?: string;

  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  ingredients?: string;

  @IsOptional()
  @ApiProperty()
  preparation?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isPublic?: boolean;
}
