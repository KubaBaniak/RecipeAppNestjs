import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { createUser } from '../src/user/test/user.factory';
import { UserRepository } from '../src/user/user.repository';
import { PersonalAccessTokenRepository } from '../src/auth/personal-access-token.repository';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as bcrypt from 'bcryptjs';
import { bcryptConstants } from '../src/auth/constants';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        AuthService,
        UserService,
        UserRepository,
        PersonalAccessTokenRepository,
        PrismaService,
        SchedulerRegistry,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await app.close();
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
          const { id, email } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(user.email);
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
      const hashed_password = await bcrypt.hash(
        user.password,
        bcryptConstants.salt,
      );
      await prismaService.user.create({
        data: { email: user.email, password: hashed_password },
      });
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

  describe('GET /auth/activate-account', () => {
    let token: string;
    beforeEach(async () => {
      const user = createUser();
      const createdUser = await authService.signUp({
        email: user.email,
        password: user.password,
      });
      token = await authService.generateAccountActivationToken(createdUser.id);
    });

    it('should activate an account', async () => {
      return request(app.getHttpServer())
        .get(`/ auth / activate - account /? token = ${token}`)
        .set('Accept', 'application/json');
    });
  });

  describe('POST /auth/change-password', () => {
    let user: { email: string; password: string };
    let accessToken: string;

    beforeEach(async () => {
      user = createUser();
      const createdUser = await authService.signUp(user);
      await authService.generateAccountActivationToken(createdUser.id);
      await authService.activateAccount(createdUser.id);
      accessToken = await authService.signIn(user);
    });

    it('should change password', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ newPassword: faker.internet.password() })
        .expect(HttpStatus.OK);
    });

    it('should not not change and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .send({ newPassword: faker.internet.password() })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not change and return 400 error (BAD REQUEST)', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ new_password: faker.internet.password() })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
