import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { userData } from './mock.user';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [AuthService, UserService, PrismaService],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany();
  });

  describe('/auth/signup (POST)', () => {
    it('should register a user and return the new user object', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(userData)
        .expect((response: request.Response) => {
          const { id, email, role } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(userData.email);
          expect(role).toEqual(Role.USER);
        })
        .expect(HttpStatus.CREATED);
    });
    it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', async () => {
      await prismaService.user.create({ data: userData });
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(userData)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('/auth/signin (POST)', () => {
    it('should generate access token for user', async () => {
      await authService.signUp(userData);
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send(userData)
        .expect((response: request.Response) => {
          const accessToken = response.body.accessToken;
          expect(accessToken).toEqual(expect.any(String));
        })
        .expect(HttpStatus.OK);
    });

    it('should not generate access token for user (wrong email) and return 401 error (UNAUTHORIZED)', async () => {
      await authService.signUp(userData);
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: userData.email,
          password: userData.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not generate access token for user (wrong password) and return 401 error (UNAUTHORIZED)', async () => {
      await prismaService.user.create({ data: userData });
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: userData.email,
          password: userData.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
