import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { WebhookRepository } from '../webhook.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import { createWebhookRequest } from './webhook.factory';
import {
  createRecipe,
  createRecipeResponse,
} from 'src/recipe/test/recipe.factory';

describe('WebhookService', () => {
  let service: WebhookService;
  let webhookRepository: WebhookRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WebhookService, WebhookRepository, PrismaService],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    webhookRepository = module.get<WebhookRepository>(WebhookRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Webhook', () => {
    it('should create a new webhook', async () => {
      const userId = faker.number.int();
      const webhookData = createWebhookRequest();
      jest.spyOn(webhookRepository, 'createWebhook').mockImplementation(() =>
        Promise.resolve({
          id: faker.number.int(),
          ...webhookData,
          userId,
        }),
      );
      jest
        .spyOn(webhookRepository, 'getAllWebhooksByUserId')
        .mockImplementation(() => Promise.all([]));

      await service.createWebhook(userId, webhookData);

      expect(webhookRepository.createWebhook).toBeCalled();
    });
  });

  describe('Delete Webhook', () => {
    it('should delete webhook', async () => {
      const userId = faker.number.int();
      const webhookId = faker.number.int();
      const webhookData = createWebhookRequest();
      jest
        .spyOn(webhookRepository, 'deleteUserWebhookById')
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(webhookRepository, 'getWebhookById').mockImplementation(() =>
        Promise.resolve({
          id: webhookId,
          ...webhookData,
          userId,
        }),
      );

      await service.deleteWebhook(userId, webhookId);

      expect(webhookRepository.deleteUserWebhookById).toHaveBeenCalled();
    });
  });

  describe('Send Webhook event', () => {
    it('should send webhook event', async () => {
      const userId = faker.number.int();
      const webhookData = createWebhookRequest();
      const testRecipe = createRecipeResponse();
      jest
        .spyOn(webhookRepository, 'getAllWebhooksByUserId')
        .mockImplementation(() =>
          Promise.all([
            {
              id: faker.number.int(),
              ...webhookData,
              userId,
            },
          ]),
        );
      jest
        .spyOn(service, 'sendToWebhook')
        .mockImplementation(() => Promise.resolve());

      await service.sendWebhookEvent(userId, testRecipe, webhookData.type);

      expect(service.sendToWebhook).toHaveBeenCalled();
    });
  });
});
