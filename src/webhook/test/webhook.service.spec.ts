import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { WebhookRepository } from '../webhook.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { faker } from '@faker-js/faker';
import {
  createWebhookRequest,
  createWebhookResponse,
  createWebhookWithUserId,
} from './webhook.factory';
import { createRecipeResponse } from 'src/recipe/test/recipe.factory';
import { TokenCrypt } from '../utils/crypt-webhook-token';
import { WebhookType } from '../dto';
import { of } from 'rxjs';

describe('WebhookService', () => {
  let service: WebhookService;
  let webhookRepository: WebhookRepository;
  let tokenCrypt: TokenCrypt;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        WebhookService,
        WebhookRepository,
        PrismaService,
        TokenCrypt,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(() =>
              of({
                data: 'data',
                headers: { url: 'http://localhost:3000/mockUrl' },
                config: { url: 'http://localhost:3000/mockUrl' },
                status: 200,
                statusText: 'OK',
              }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    webhookRepository = module.get<WebhookRepository>(WebhookRepository);
    tokenCrypt = module.get<TokenCrypt>(TokenCrypt);
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Webhook', () => {
    it('should create a new webhook', async () => {
      const userId = faker.number.int();
      const webhookData = createWebhookRequest();
      jest
        .spyOn(webhookRepository, 'createWebhook')
        .mockImplementation(() => Promise.resolve(createWebhookResponse()));
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

      jest
        .spyOn(webhookRepository, 'getWebhookById')
        .mockImplementation(() =>
          Promise.resolve(createWebhookWithUserId(userId)),
        );
      jest
        .spyOn(webhookRepository, 'deleteUserWebhookById')
        .mockImplementation(() => Promise.resolve(createWebhookResponse()));

      await service.deleteWebhook(userId, webhookId);

      expect(webhookRepository.deleteUserWebhookById).toHaveBeenCalled();
    });
  });

  describe('Create webhook event', () => {
    it('should create webhook event', async () => {
      const webhookId = faker.number.int({ max: 128 });
      const recipe = createRecipeResponse();
      const type = WebhookType.RecipeCreated;
      jest
        .spyOn(webhookRepository, 'getAllWebhooksByUserId')
        .mockImplementationOnce(() => Promise.all([createWebhookResponse()]));

      const spy = jest.spyOn(webhookRepository, 'createWebhookEvent');

      await service.createWebhookEvent(webhookId, recipe, type);

      expect(spy).toBeCalled();
    });
  });

  describe('Send webhook event', () => {
    it('should send webhook event and fail', async () => {
      const url = faker.internet.url();
      const recipe = createRecipeResponse();
      const success = service.sendWebhookEvent(url, JSON.stringify(recipe));

      expect(success).toBeTruthy();
    });
  });

  describe('Token encryption and decryption', () => {
    it('should encrypt and decrypt token', async () => {
      const token = 'my_secret_token';
      const { encryptedToken, iv, authTag } = tokenCrypt.encryptToken(token);

      const decryptedToken = tokenCrypt.decryptToken(
        encryptedToken,
        iv,
        authTag,
      );

      expect(decryptedToken).toEqual(token);
    });
  });
});
