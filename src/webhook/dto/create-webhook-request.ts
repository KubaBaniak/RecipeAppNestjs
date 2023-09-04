import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WebhookEventType } from './webhook-event-types';

export class CreateWebhookRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    enum: ['recipe_created', 'recipe_updated', 'recipe_deleted'],
  })
  @IsIn(['recipe_created', 'recipe_updated', 'recipe_deleted'])
  type: WebhookEventType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string;
}
