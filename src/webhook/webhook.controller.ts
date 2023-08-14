import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { UserRepository } from '../user/user.repository';
import { UserId } from '../common/decorators/req-user-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Webhook } from '@prisma/client';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly userRepository: UserRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @Post()
  createWebhook(
    @UserId() userId: number,
    @Body() webhookDataTemp: { name: string; type: string },
  ): void {
    this.webhookService.createWebhook(userId, webhookDataTemp);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete(':id')
  async deleteWebhook(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) webhookId: number,
  ) {
    const webhook = await this.userRepository.getWebhookById(webhookId);
    if (!webhook) {
      throw new NotFoundException();
    }
    if (userId !== webhook.userId) {
      throw new UnauthorizedException();
    }
    this.userRepository.deleteUserWebhookByName(webhookId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async listWebhooks(@UserId() userId: number): Promise<Webhook[]> {
    const webhooks = await this.userRepository.getAllWebhooksByUserId(userId);
    return webhooks;
  }
}
