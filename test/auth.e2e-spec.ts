import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { createUser } from './user.factory';
import { UserRepository } from '../src/user/user.repository';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [AuthService, UserService, UserRepository, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  describe('POST /auth/signup', () => {
    let user: { email: string; password: string };

    beforeEach(() => {
      user = createUser();
    });

    it('should register a user and return the new user object', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(user)
        .expect((response: request.Response) => {
          const { id, email, role } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(user.email);
          expect(role).toEqual(Role.USER);
        })
        .expect(HttpStatus.CREATED);
    });

    it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', async () => {
      await prismaService.user.create({ data: user });
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(user)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /auth/signin', () => {
    let user: { email: string; password: string };

    beforeEach(async () => {
      user = createUser();
      await authService.signUp(user);
    });

    it('should generate access token for user', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send(user)
        .expect((response: request.Response) => {
          const accessToken = response.body.accessToken;
          expect(accessToken).toEqual(expect.any(String));
        })
        .expect(HttpStatus.OK);
    });

    it('should not generate access token for user (wrong email) and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: user.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not generate access token for user (wrong password) and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: user.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
