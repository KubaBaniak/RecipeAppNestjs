import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from '../webhook.controller';
import { WebhookService } from '../webhook.service';
import { WebhookRepository } from '../webhook.repository';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtils } from '../utils/crypt-webhook-token';

describe('WebhookController', () => {
  let controller: WebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WebhookController],
      providers: [
        WebhookService,
        WebhookRepository,
        CryptoUtils,
        PrismaService,
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
