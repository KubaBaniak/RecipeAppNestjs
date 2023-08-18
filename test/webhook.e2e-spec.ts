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

describe('WebhookController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prismaService: PrismaService;
  let user: User;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WebhookModule, HttpModule, AuthModule],
      providers: [PrismaService, WebhookService, WebhookRepository],
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

  afterEach(() => {
    prismaService.webhook.deleteMany({});
  });

  describe('POST /webhooks', () => {
    it('should create webhook', async () => {
      const webhook = createWebhookRequest();
      return request(app.getHttpServer())
        .post('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(webhook)
        .expect((response: request.Response) => {
          const { name, type, url, token } = response.body;
          console.log(response.body);
          expect(name).toEqual(webhook.name);
          expect(type).toEqual(webhook.type);
          expect(url).toEqual(webhook.url);
          expect(token).toEqual(webhook.token);
        })
        .expect(HttpStatus.CREATED);
    });
  });

  describe('GET /webhooks', () => {
    beforeEach(async () => {
      await prismaService.webhook.createMany({
        data: [
          createWebhookWithUserId(user.id, {}),
          createWebhookWithUserId(user.id, {}),
          createWebhookWithUserId(user.id, {}),
        ],
      });
    });

    it('it should find all webhooks owned by a user with id', async () => {
      return request(app.getHttpServer())
        .get('/webhooks')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect((response: request.Response) => {
          expect(response.body).toHaveLength(3);
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /webhooks', () => {
    it('should delete webhook given id', async () => {
      await prismaService.webhook.create({
        data: createWebhookWithUserId(user.id, {}),
      });
      return request(app.getHttpServer())
        .delete(`/webhooks`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(async () => {
          expect(await prismaService.webhook.findMany()).toHaveLength(0);
        })
        .expect(HttpStatus.OK);
    });
  });
});
