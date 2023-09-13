import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from '../webhook.controller';
import { WebhookService } from '../webhook.service';
import { WebhookRepository } from '../webhook.repository';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { CreateWebhookRequest, WebhookEventType } from '../dto';
import { createWebhookResponse } from './webhook.factory';
import { CryptoUtils } from '../utils/crypt-webhook-token';

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: WebhookService;

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
    webhookService = module.get<WebhookService>(WebhookService);
    controller = module.get<WebhookController>(WebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Webhook', () => {
    const userId = faker.number.int();

    beforeEach(() => {
      jest
        .spyOn(webhookService, 'createWebhook')
        .mockImplementation((_userId: number, _data: CreateWebhookRequest) =>
          Promise.resolve(createWebhookResponse()),
        );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new webhook with token', () => {
      const data: CreateWebhookRequest = {
        name: faker.word.noun(),
        type: WebhookEventType.RecipeCreated,
        url: faker.internet.url(),
      };

      controller.createWebhook(userId, data);

      expect(webhookService.createWebhook).toHaveBeenCalled();
    });

    it('should create a new webhook without token', () => {
      const data: CreateWebhookRequest = {
        name: faker.word.noun(),
        type: WebhookEventType.RecipeDeleted,
        url: faker.internet.url(),
        token: faker.string.alphanumeric(32),
      };

      controller.createWebhook(userId, data);

      expect(webhookService.createWebhook).toHaveBeenCalled();
    });
  });

  describe('Delete webhook', () => {
    it('should delete a webhook given id', () => {
      jest
        .spyOn(WebhookService.prototype, 'deleteWebhook')
        .mockImplementation((_userId: number, _webhookId: number) =>
          Promise.resolve(createWebhookResponse()),
        );

      const userId = faker.number.int();
      const webhookId = faker.number.int();

      controller.deleteWebhook(userId, webhookId);

      expect(webhookService.deleteWebhook).toHaveBeenCalled();
    });
  });

  describe('List webhook', () => {
    it('should list all webhooks owned by a user', async () => {
      const returnItem = [
        {
          id: faker.number.int(),
          name: faker.word.noun(),
          url: faker.internet.url(),
          type: WebhookEventType.RecipeCreated,
        },
      ];
      jest
        .spyOn(webhookService, 'getWebhooksByUserId')
        .mockImplementation(async (_userId: number) => {
          return returnItem;
        });

      const userId = faker.number.int();

      const response = await controller.listWebhooks(userId);

      expect(webhookService.getWebhooksByUserId).toHaveBeenCalled();
      expect(response.webhooks).toHaveLength(1);
    });
  });
});
