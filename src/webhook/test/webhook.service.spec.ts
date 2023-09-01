import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { HttpModule } from '@nestjs/axios';
import { WebhookRepository } from '../webhook.repository';
import { CronWebhook } from '../cron-schedule';
import { TokenCrypt } from '../utils/crypt-webhook-token';
import { PrismaService } from '../../prisma/prisma.service';
import { MockTokenCrypt } from '../__mocks__/crypt-webhook-token.mock';

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WebhookService,
        WebhookRepository,
        PrismaService,
        {
          provide: TokenCrypt,
          useClass: MockTokenCrypt,
        },
        {
          provide: CronWebhook,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});