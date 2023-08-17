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
import { CreateWebhookRequest, ListWebhooksDto } from './dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post()
  createWebhook(
    @UserId() userId: number,
    @Body() webhookData: CreateWebhookRequest,
  ): void {
    this.webhookService.createWebhook(userId, webhookData);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete(':id')
  async deleteWebhook(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) webhookId: number,
  ): Promise<void> {
    this.webhookService.deleteWebhook(userId, webhookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listWebhooks(@UserId() userId: number): Promise<ListWebhooksDto[]> {
    return await this.webhookService.getWebhooksById(userId);
  }
}
