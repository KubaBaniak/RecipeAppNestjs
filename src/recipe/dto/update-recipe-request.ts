import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRecipeRequest {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @ApiProperty()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  ingredients?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  preparation?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isPublic?: boolean;
}
