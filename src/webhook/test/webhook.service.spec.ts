import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookRepository } from '../webhook.repository';
import { CryptoUtils } from '../utils/crypt-webhook-token';
import { PrismaService } from '../../prisma/prisma.service';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WebhookService,
        WebhookRepository,
        PrismaService,
        CryptoUtils,
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
