import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebhookRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    enum: ['CREATE', 'UPDATE', 'DELETE'],
  })
  @IsIn(['CREATE', 'UPDATE', 'DELETE'])
  type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string;
}
