import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRecipeRequest {
  @IsOptional()
  @IsString()
  @ApiProperty()
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @IsOptional()
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
