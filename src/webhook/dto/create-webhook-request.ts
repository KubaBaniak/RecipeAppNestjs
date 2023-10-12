import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';
import { NoDuplicateAndOtherTypes } from './custom-class-validators';
import { WebhookEventType } from './webhook-event-types';

export class CreateWebhookRequest {
  @IsString()
  @Length(4, 255, {
    message: 'name should should have 4-255 characters',
  })
  @ApiProperty()
  name: string;

  @NoDuplicateAndOtherTypes(
    ['recipe_created', 'recipe_updated', 'recipe_deleted'],
    {
      message: `Invalid or duplicate event type detected in the array. Use these types: ${Object.values(
        WebhookEventType,
      )}`,
    },
  )
  @ApiProperty({
    enum: ['recipe_created', 'recipe_updated', 'recipe_deleted'],
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
