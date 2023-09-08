import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/auth/auth.module';
import { AuthService } from '../src/auth/auth.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { UserService } from '../src/user/user.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { createUser, createUserResponse } from '../src/user/test/user.factory';
import { UserRepository } from '../src/user/user.repository';
import { PersonalAccessTokenRepository } from '../src/auth/personal-access-token.repository';
import { SignInRequest } from 'src/auth/dto';
import { authenticator } from 'otplib';

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
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  afterEach(() => {
    prismaService.user.deleteMany();
  });

  describe('POST /auth/signup', () => {
    const tempUser = createUser();
    it('should register a user and return the new user object', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(tempUser)
        .expect((response: request.Response) => {
          const { id, email, role } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(tempUser.email);
          expect(role).toEqual(Role.USER);
        })
        .expect(HttpStatus.CREATED);
    });

    it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(tempUser)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /auth/signin', () => {
    let accessToken: string;
    let tempUser: SignInRequest;
    beforeEach(async () => {
      tempUser = createUser();
      await authService.signUp(tempUser);
      accessToken = await authService.signIn(tempUser);
    });

    it('should generate access token for user', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send(tempUser)
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
          email: tempUser.email,
          password: tempUser.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not generate access token for user (wrong password) and return 401 error (UNAUTHORIZED)', async () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: tempUser.email,
          password: tempUser.password + faker.word.noun(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/change-password', () => {
    let accessToken: string;
    beforeEach(async () => {
      const tempUser = createUser();
      await authService.signUp(tempUser);
      accessToken = await authService.signIn(tempUser);
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

  describe('2FA Tests', () => {
    let VALUE_FOR_USER_CREATION = faker.number.int({
      min: 25000,
      max: 2000000,
    });

    describe('POST /auth/create-qr-2fa', () => {
      let accessToken: string;
      beforeEach(async () => {
        const tempUser = createUser();
        await authService.signUp(tempUser);
        accessToken = await authService.signIn(tempUser);
      });
      it('should create a new qrcode for 2fa', async () => {
        return request(app.getHttpServer())
          .post('/auth/create-qr-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .expect((response: request.Response) => {
            const { qrcodeUrl, urlToEnable2FA } = response.body;
            expect(qrcodeUrl).toBeDefined();
            expect(urlToEnable2FA).toBeDefined();
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('POST /auth/enable-2fa', () => {
      let accessToken: string;
      beforeEach(async () => {
        const tempUser = createUser();
        await authService.signUp(tempUser);
        accessToken = await authService.signIn(tempUser);
      });
      it('should enable 2fa on user account', async () => {
        return request(app.getHttpServer())
          .post('/auth/enable-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: authenticator.generate(process.env.SECRET_KEY_2FA) })
          .expect((response: request.Response) => {
            const { recoveryKeys } = response.body;
            expect(recoveryKeys).toHaveLength(3);
            recoveryKeys.forEach((key: string) => {
              expect(typeof key).toBe('string');
            });
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/disable-2fa', () => {
      let accessToken: string;
      beforeEach(async () => {
        const tempUser = await prismaService.user.create({
          data: createUserResponse({
            id: VALUE_FOR_USER_CREATION++,
            enabled2FA: true,
          }),
        });
        accessToken = await authService.signIn({
          email: tempUser.email,
          password: tempUser.password,
        });
      });
      it('should disable 2fa on user account', async () => {
        request(app.getHttpServer())
          .post('/auth/disable-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/verify-2fa', () => {
      let accessToken: string;
      beforeEach(async () => {
        const tempUser = await prismaService.user.create({
          data: createUserResponse({
            id: VALUE_FOR_USER_CREATION++,
            enabled2FA: true,
          }),
        });
        accessToken = await authService.signIn({
          email: tempUser.email,
          password: tempUser.password,
        });
      });
      it('should verify on user using 2fa', async () => {
        request(app.getHttpServer())
          .post('/auth/verify-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: authenticator.generate(process.env.SECRET_KEY_2FA) })
          .expect((response: request.Response) => {
            const accessToken = response.body.accessToken;
            expect(typeof accessToken).toBe('string');
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/recovery-2fa', () => {
      const RECOVERY_KEY = 'test';
      let accessToken: string;
      beforeEach(async () => {
        const tempUser = await prismaService.user.create({
          data: createUserResponse({
            id: VALUE_FOR_USER_CREATION++,
            enabled2FA: true,
            recoveryKeys: [RECOVERY_KEY, 'recovery', 'key'],
          }),
        });
        accessToken = await authService.signIn({
          email: tempUser.email,
          password: tempUser.password,
        });
      });
      it('should verify on user using 2fa', async () => {
        request(app.getHttpServer())
          .post('/auth/verify-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: RECOVERY_KEY })
          .expect((response: request.Response) => {
            const accessToken = response.body.accessToken;
            expect(typeof accessToken).toBe('string');
          })
          .expect(HttpStatus.OK);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
