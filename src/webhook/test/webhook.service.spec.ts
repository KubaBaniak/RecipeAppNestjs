import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { WebhookRepository } from '../webhook.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WebhookService, WebhookRepository, PrismaService],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
