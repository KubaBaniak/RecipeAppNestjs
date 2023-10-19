import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { WebhookEventType } from './webhook-event-types';
import { Transform } from 'class-transformer';

export class CreateWebhookRequest {
  @IsString()
  @Length(4, 255, {
    message: 'name should be between 4 and 255 characters long',
  })
  @ApiProperty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => Array.from(new Set(value)))
  @IsIn(['recipe_created', 'recipe_updated', 'recipe_deleted'], { each: true })
  @ApiProperty({
    type: String,
    isArray: true,
    example: ['recipe_created', 'recipe_updated', 'recipe_deleted'],
  })
  types: WebhookEventType[];

  @IsUrl()
  @ApiProperty()
  url: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  token?: string;
}
