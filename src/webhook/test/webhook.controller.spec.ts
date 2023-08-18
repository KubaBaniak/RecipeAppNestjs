import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from '../webhook.controller';
import { WebhookService } from '../webhook.service';
import { PATRepository } from '../webhook.repository';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { CreateWebhookRequest } from '../dto';

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: WebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WebhookController],
      providers: [WebhookService, PATRepository, PrismaService],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    webhookService = module.get<WebhookService>(WebhookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create Webhook', () => {
    const userId = faker.number.int();

    beforeEach(() => {
      jest
        .spyOn(WebhookService.prototype, 'createWebhook')
        .mockImplementation((_userId: number, _data: CreateWebhookRequest) =>
          Promise.resolve(),
        );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new webhook with token', () => {
      const data: CreateWebhookRequest = {
        name: faker.word.noun(),
        type: 'CREATE',
        url: faker.internet.url(),
      };

      controller.createWebhook(userId, data);

      expect(webhookService.createWebhook).toHaveBeenCalled();
    });

    it('should create a new webhook without token', () => {
      const data: CreateWebhookRequest = {
        name: faker.word.noun(),
        type: 'OTHER',
        url: faker.internet.url(),
        token: faker.string.alphanumeric(32),
      };

      controller.createWebhook(userId, data);

      expect(webhookService.createWebhook).toHaveBeenCalled();
    });
  });

  describe('Delete webhook', () => {
    it('should delete a token given id', () => {
      jest
        .spyOn(WebhookService.prototype, 'deleteWebhook')
        .mockImplementation((_userId: number, _webhookId: number) =>
          Promise.resolve(),
        );

      const userId = faker.number.int();
      const webhookId = faker.number.int();

      controller.deleteWebhook(userId, webhookId);

      expect(webhookService.deleteWebhook).toHaveBeenCalled();

      jest.clearAllMocks();
    });
  });

  describe('List webhook', () => {
    it('should list all webhooks owned by a user', () => {
      const returnItem = {
        id: faker.number.int(),
        name: faker.word.noun(),
        url: faker.internet.url(),
        token: faker.string.alphanumeric(),
        type: 'CREATE',
      };
      jest
        .spyOn(WebhookService.prototype, 'getWebhooksById')
        .mockImplementation((_userId: number) => {
          return returnItem;
        });

      const userId = faker.number.int();
      const webhookId = faker.number.int();

      controller.deleteWebhook(userId, webhookId);

      expect(webhookService.getWebhooksById).toHaveBeenCalled();

      jest.clearAllMocks();
    });
  });
});
