import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { CreateWebhookRequest, FetchWebhooksResponse } from './dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('webhooks')
@ApiTags('Webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create webhook' })
  @Post()
  async createWebhook(
    @UserId() userId: number,
    @Body() webhookData: CreateWebhookRequest,
  ): Promise<void> {
    try {
      await this.webhookService.createWebhook(userId, webhookData);
    } catch {
      throw new ForbiddenException(
        `User reached the limit of owned webhooks (max. ${process.env.WEBHOOK_LIMIT})`,
      );
    }
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
  @HttpCode(200)
  @ApiOperation({ summary: 'List all webhooks owned by user' })
  @Get()
  async listWebhooks(@UserId() userId: number): Promise<FetchWebhooksResponse> {
    const fetchedWebhooks = await this.webhookService.getWebhooksByUserId(
      userId,
    );
    return FetchWebhooksResponse.from(fetchedWebhooks);
  }
}
