import request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { createUser } from '../src/user/test/user.factory';
import { User } from '@prisma/client';
import { HttpModule } from '@nestjs/axios';
import { WebhookService } from '../src/webhook/webhook.service';
import { WebhookRepository } from '../src/webhook/webhook.repository';
import { AuthService } from '../src/auth/auth.service';
import {
  createWebhookRequest,
  createWebhookWithUserId,
} from '../src/webhook/test/webhook.factory';
import { AuthModule } from '../src/auth/auth.module';
import { WebhookModule } from '../src/webhook/webhook.module';
import { CryptoUtils } from '../src/webhook/utils/crypt-webhook-token';

describe('WebhookController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prismaService: PrismaService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WebhookModule, HttpModule, AuthModule],
      providers: [
        PrismaService,
        WebhookService,
        WebhookRepository,
        CryptoUtils,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    user = await prismaService.user.create({
      data: createUser(),
    });

    accessToken = await authService.signIn({
      email: user.email,
      password: user.password,
    });
  });

  afterAll(async () => {
    await prismaService.webhook.deleteMany();
  });

  describe('POST /webhooks', () => {
    it('should create webhook', async () => {
      const webhook = createWebhookRequest();
      request(app.getHttpServer())
        .post('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(webhook)
        .expect(HttpStatus.CREATED);
      expect(
        await prismaService.webhook.findFirst({
          where: { name: webhook.name },
        }),
      ).toBeDefined();
    });
    it('should not create new webhook due to the limit (5 webhooks)', async () => {
      const testWebhooks = [
        createWebhookWithUserId(user.id),
        createWebhookWithUserId(user.id),
        createWebhookWithUserId(user.id),
        createWebhookWithUserId(user.id),
        createWebhookWithUserId(user.id),
      ];
      await prismaService.webhook.createMany({
        data: testWebhooks,
      });
      const webhook = createWebhookRequest();
      request(app.getHttpServer())
        .post('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(webhook)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('GET /webhooks', () => {
    it('it should find all webhooks owned by a user with id', async () => {
      const testWebhooks = [
        createWebhookWithUserId(user.id, {}),
        createWebhookWithUserId(user.id, {}),
        createWebhookWithUserId(user.id, {}),
      ];
      await prismaService.webhook.createMany({
        data: testWebhooks,
      });

      return request(app.getHttpServer())
        .get('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          expect(response.body.webhooks).toEqual(
            expect.arrayContaining([
              {
                id: expect.any(Number),
                name: expect.any(String),
                type: expect.any(String),
                url: expect.any(String),
              },
            ]),
          );
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /webhooks', () => {
    it('should delete webhook given id', async () => {
      const createdWebhook = await prismaService.webhook.create({
        data: createWebhookWithUserId(user.id, {}),
      });
      return request(app.getHttpServer())
        .delete(`/webhooks/${createdWebhook.id}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
