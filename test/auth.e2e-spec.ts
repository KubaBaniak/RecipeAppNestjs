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
import { TwoFactorAuthRepository } from '../src/auth/twoFactorAuth.repository';
import { add2faToUserWithId } from '../src/auth/test/auth.factory';
import { authenticator } from 'otplib';
import { BCRYPT, NUMBER_OF_2FA_RECOVERY_TOKENS } from '../src/auth/constants';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authService: AuthService;
  let twoFactorAuthRepository: TwoFactorAuthRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        AuthService,
        TwoFactorAuthRepository,
        UserService,
        UserRepository,
        PersonalAccessTokenRepository,
        PrismaService,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authService = moduleRef.get<AuthService>(AuthService);
    twoFactorAuthRepository = moduleRef.get<TwoFactorAuthRepository>(
      TwoFactorAuthRepository,
    );

    app.useGlobalPipes(new ValidationPipe());

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
    it('should register a user and return the new user object', async () => {
      const tempUser = createUser();
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(tempUser)
        .expect((response: request.Response) => {
          const { id, email } = response.body;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(tempUser.email);
        })
        .expect(HttpStatus.CREATED);
    }, 60000);

    it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', async () => {
      const tempUser = createUser();
      await prismaService.user.create({ data: tempUser });
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(tempUser)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /auth/signin', () => {
    const tempUser = createUser();
    beforeAll(async () => {
      const hashed_password = await bcrypt.hash(tempUser.password, BCRYPT.salt);
      await prismaService.user.create({
        data: {
          email: tempUser.email,
          password: hashed_password,
        },
      });
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
    let accessToken: string;

    beforeEach(async () => {
      const tempUser = createUser();
      await prismaService.user.create({ data: tempUser });
      accessToken = await authService.signIn(tempUser);
    });

    it('should change password', async () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ newPassword: faker.internet.password({ length: 64 }) })
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

  describe('GET /auth/activate-account', () => {
    let accessToken: string;
    beforeEach(async () => {
      const user = createUser();
      const createdUser = await authService.signUp({
        email: user.email,
        password: user.password,
      });
      accessToken = await authService.generateAccountActivationToken(
        createdUser.id,
      );
    });

    it('should activate an account', async () => {
      return request(app.getHttpServer())
        .get(`/auth/activate-account/?token=${accessToken}`)
        .set('Accept', 'application/json');
    });
  });

  describe('GET /auth/reset-password-email', () => {
    let user: { email: string; password: string };
    beforeEach(async () => {
      user = createUser();
      const createdUser = await authService.signUp({
        email: user.email,
        password: user.password,
      });
      await authService.activateAccount(createdUser.id);
    });

    it('should send an email with reset password link', async () => {
      return request(app.getHttpServer())
        .get(`/auth/reset-password-email`)
        .set('Accept', 'application/json')
        .send({ email: user.email });
    });
  });

  describe('2FA Tests', () => {
    describe('POST /auth/create-qr-code-for-2fa-authenticator-app', () => {
      let accessToken: string;
      beforeEach(async () => {
        const userData = createUser();
        const tempUser = await prismaService.user.create({ data: userData });
        accessToken = await authService.signIn(tempUser);
      });
      it('should create a new QR code for 2fa', async () => {
        return request(app.getHttpServer())
          .post('/auth/create-qr-code-for-2fa-authenticator-app')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .expect((response: request.Response) => {
            const { qrCodeUrl, urlToEnable2FA } = response.body;
            expect(qrCodeUrl).toBeDefined();
            expect(urlToEnable2FA).toBeDefined();
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('POST /auth/enable-2fa', () => {
      let accessToken: string;
      let secretKey: string;
      beforeEach(async () => {
        const userData = createUser();
        const tempUser = await prismaService.user.create({ data: userData });
        const twoFactorAuthData = await prismaService.twoFactorAuth.create({
          data: add2faToUserWithId(tempUser.id),
        });
        secretKey = twoFactorAuthData.secretKey;
        accessToken = await authService.signIn(userData);
      });
      it('should enable 2fa on user account', async () => {
        return request(app.getHttpServer())
          .post('/auth/enable-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: authenticator.generate(secretKey) })
          .expect((response: request.Response) => {
            const { recoveryKeys } = response.body;
            expect(recoveryKeys).toHaveLength(NUMBER_OF_2FA_RECOVERY_TOKENS);
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
          data: createUser(),
        });
        accessToken = await authService.signIn({
          email: tempUser.email,
          password: tempUser.password,
        });
        await prismaService.twoFactorAuth.create({
          data: add2faToUserWithId(tempUser.id),
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
      let secretKey: string;
      beforeEach(async () => {
        const createdUser = await prismaService.user.create({
          data: createUser(),
        });
        await prismaService.twoFactorAuth.create({
          data: add2faToUserWithId(createdUser.id),
        });
        accessToken = await authService.signIn({
          email: createdUser.email,
          password: createdUser.password,
        });
        const secretKeyObject =
          await twoFactorAuthRepository.get2faSecretKeyForUserWithId(
            createdUser.id,
          );
        secretKey = secretKeyObject.secretKey;
      });

      it('should verify on user using 2fa', async () => {
        request(app.getHttpServer())
          .post('/auth/verify-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: authenticator.generate(secretKey) })
          .expect((response: request.Response) => {
            const accessToken = response.body.accessToken;
            expect(typeof accessToken).toBe('string');
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/verify-2fa (with recovery keys)', () => {
      let accessToken: string;
      let recoveryKey: string;
      beforeEach(async () => {
        const tempUser = await prismaService.user.create({
          data: createUser(),
        });
        accessToken = await authService.signIn({
          email: tempUser.email,
          password: tempUser.password,
        });
        await prismaService.twoFactorAuth.create({
          data: add2faToUserWithId(tempUser.id),
        });
        const recoveryKeys = await authService.generate2faRecoveryKeys(
          tempUser.id,
        );
        recoveryKey = recoveryKeys[0];
      });
      it('should recover account with recovery key', async () => {
        request(app.getHttpServer())
          .post('/auth/verify-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: `${recoveryKey}` })
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
