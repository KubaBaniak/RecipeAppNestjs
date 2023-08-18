import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserId } from '../common/decorators/req-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWebhookRequest } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Webhook } from '@prisma/client';

@Controller('webhooks')
@ApiTags('Webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create webhook' })
  @Post()
  createWebhook(
    @UserId() userId: number,
    @Body() webhookData: CreateWebhookRequest,
  ): void {
    this.webhookService.createWebhook(userId, webhookData);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete webhook with given id' })
  @Delete(':id')
  async deleteWebhook(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) webhookId: number,
  ): Promise<void> {
    this.webhookService.deleteWebhook(userId, webhookId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all webhooks owned by user' })
  @Get()
  async listWebhooks(@UserId() userId: number): Promise<Webhook[]> {
    return await this.webhookService.getWebhooksById(userId);
  }
}
