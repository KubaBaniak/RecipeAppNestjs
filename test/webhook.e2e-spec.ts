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
import {
  createWebhookRequest,
  createWebhookWithUserId,
} from '../src/webhook/test/webhook.factory';
import { WebhookModule } from '../src/webhook/webhook.module';
import { CryptoUtils } from '../src/webhook/utils/crypt-webhook-token';
import { AuthModule } from '../src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

describe('WebhookController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let user: User;
  let accessToken: string;
  let jwtService: JwtService;

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
    jwtService = moduleRef.get<JwtService>(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();

    user = await prismaService.user.create({
      data: createUser(),
    });

    accessToken = jwtService.sign(
      { id: user.id },
      { secret: process.env.JWT_SECRET },
    );
  });

  beforeEach(async () => {
    await prismaService.webhook.deleteMany();
    await prismaService.webhookEvent.deleteMany();
  });

  describe('POST /webhooks', () => {
    it('should create webhook', async () => {
      const webhook = createWebhookRequest();
      return request(app.getHttpServer())
        .post('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(webhook)
        .expect(async () => {
          const createdWebhook = await prismaService.webhook.findFirst({
            where: {
              name: webhook.name,
            },
          });
          expect(createdWebhook).toBeDefined();
        })
        .expect(HttpStatus.CREATED);
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
      return request(app.getHttpServer())
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
                types: expect.any(Array<string>),
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
    await prismaService.webhook.deleteMany();
    await app.close();
  });
});
