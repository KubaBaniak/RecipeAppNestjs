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
import { NUMBER_OF_2FA_RECOVERY_TOKENS } from '../src/auth/constants';
import { PendingUsersRepository } from '../src/user/pending-user.repository';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { mock } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authClient: AmqpConnection;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
        AuthService,
        JwtService,
        PendingUsersRepository,
        UserService,
        UserRepository,
        PrismaService,
        { provide: AmqpConnection, useValue: mock<AmqpConnection>() },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    authClient = moduleRef.get<AmqpConnection>(AmqpConnection);
    jwtService = moduleRef.get<JwtService>(JwtService);

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
      const token = faker.string.alphanumeric({ length: 64 });
      jest.spyOn(authClient, 'request').mockResolvedValue({
        accountActivationToken: token,
      });
      const { email } = createUser();
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({ email, password: faker.internet.password({ length: 64 }) })
        .expect(async (response: request.Response) => {
          const { accountActivationToken } = response.body;
          const createdUser = await prismaService.pendingUsers.findUnique({
            where: { email },
          });
          expect(typeof accountActivationToken).toBe('string');
          expect(createdUser.email).toEqual(email);
        })
        .expect(HttpStatus.CREATED);
    }, 60000);

    it('should not register a user (already in db) and return 403 error (FORBIDDEN ACCESS)', async () => {
      const user = await prismaService.user.create({ data: createUser() });
      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: faker.internet.password({ length: 64 }),
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /auth/signin', () => {
    it('should generate access token for user', async () => {
      const user = await prismaService.user.create({
        data: createUser(),
      });
      jest.spyOn(authClient, 'request').mockResolvedValue({
        accessToken: faker.string.alphanumeric({ length: 64 }),
      });
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: faker.internet.password({ length: 64 }),
        })
        .expect((response: request.Response) => {
          const accessToken = response.body.accessToken;
          expect(accessToken).toEqual(expect.any(String));
        })
        .expect(HttpStatus.OK);
    });

    it('should not generate access token for user (wrong email) and return 401 error (UNAUTHORIZED)', async () => {
      const user = await prismaService.user.create({
        data: createUser(),
      });
      jest.spyOn(authClient, 'request').mockResolvedValue({
        message: 'Unauthorized',
        status: 401,
      });
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: faker.internet.password({ length: 64 }),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not generate access token for user (wrong password) and return 401 error (UNAUTHORIZED)', async () => {
      const user = await prismaService.user.create({
        data: createUser(),
      });
      jest.spyOn(authClient, 'request').mockResolvedValue({
        message: 'Unauthorized',
        status: 401,
      });
      return request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: user.email,
          password: faker.internet.password(),
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /auth/activate-account', () => {
    it('should activate an account', async () => {
      const user = await prismaService.pendingUsers.create({
        data: createUser(),
      });
      const token = jwtService.sign(
        { id: user.id },
        {
          secret: process.env.JWT_ACCOUNT_ACTIVATION_SECRET,
        },
      );
      jest.spyOn(authClient, 'request').mockResolvedValue(user.id);

      return request(app.getHttpServer())
        .get(`/auth/activate-account/?token=${token}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK);
    });
  });

  describe('POST /auth/change-password', () => {
    it('should change password', async () => {
      const user = await prismaService.user.create({ data: createUser() });
      const accessToken = jwtService.sign(
        { id: user.id },
        { secret: process.env.JWT_SECRET },
      );
      jest.spyOn(authClient, 'request').mockResolvedValue(user.id);
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ newPassword: faker.internet.password({ length: 64 }) })
        .expect(HttpStatus.OK);
    });

    it('should not not change and return 401 error (UNAUTHORIZED)', async () => {
      const user = await prismaService.user.create({ data: createUser() });
      jest.spyOn(authClient, 'request').mockResolvedValue(user.id);
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .send({ newPassword: faker.internet.password() })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should not change and return 400 error (BAD REQUEST)', async () => {
      const user = await prismaService.user.create({ data: createUser() });
      const accessToken = jwtService.sign(
        { id: user.id },
        { secret: process.env.JWT_SECRET },
      );
      jest.spyOn(authClient, 'request').mockResolvedValue(user.id);
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Accept', 'application/json')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ new_password: faker.internet.password() })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /auth/reset-password-email', () => {
    it('should send an email with reset password link', async () => {
      const user = await prismaService.user.create({ data: createUser() });
      jest
        .spyOn(authClient, 'request')
        .mockResolvedValue(faker.string.alphanumeric({ length: 64 }));
      return request(app.getHttpServer())
        .get(`/auth/reset-password-email`)
        .set('Accept', 'application/json')
        .send({ email: user.email });
    });
  });

  describe('2FA Tests', () => {
    describe('POST /auth/create-qr-code-for-2fa-authenticator-app', () => {
      it('should create a new QR code for 2FA', async () => {
        const user = await prismaService.user.create({ data: createUser() });
        const accessToken = jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET },
        );
        const qrCodeUrl = faker.internet.url();
        jest.spyOn(authClient, 'request').mockResolvedValue({ qrCodeUrl });
        return request(app.getHttpServer())
          .post('/auth/create-qr-code-for-2fa-authenticator-app')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .expect((response: request.Response) => {
            expect(response.body.qrCodeUrl).toEqual(qrCodeUrl);
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('POST /auth/enable-2fa', () => {
      it('should enable 2FA on user account', async () => {
        const user = await prismaService.user.create({
          data: createUser(),
        });
        const accessToken = jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET },
        );
        const twoFactorAuthToken = faker.string.numeric({ length: 6 });
        const recoveryKeys = Array.from(
          { length: NUMBER_OF_2FA_RECOVERY_TOKENS },
          () => faker.string.alphanumeric(),
        );
        jest.spyOn(authClient, 'request').mockResolvedValue({ recoveryKeys });
        return request(app.getHttpServer())
          .post('/auth/enable-2fa')
          .set('Accept', 'application/json')
          .set({
            Authorization: `Bearer ${accessToken}`,
          })
          .send({
            token: twoFactorAuthToken,
          })
          .expect((response: request.Response) => {
            const { recoveryKeys } = response.body;
            expect(recoveryKeys).toHaveLength(NUMBER_OF_2FA_RECOVERY_TOKENS);
            expect(recoveryKeys).toBeInstanceOf(Array<string>);
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/disable-2fa', () => {
      it('should disable 2FA on user account', async () => {
        const user = await prismaService.user.create({
          data: createUser(),
        });
        const accessToken = jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET },
        );
        jest.spyOn(authClient, 'request').mockResolvedValue(user.id);
        request(app.getHttpServer())
          .post('/auth/disable-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .expect(HttpStatus.OK);
      });
    });

    describe('POST /auth/verify-2fa', () => {
      it('should verify on user using 2FA', async () => {
        const user = await prismaService.user.create({
          data: createUser(),
        });
        const accessToken = jwtService.sign(
          { id: user.id },
          { secret: process.env.JWT_SECRET },
        );
        jest.spyOn(authClient, 'request').mockResolvedValue(user.id);
        const twoFactAuthToken = faker.string.numeric({ length: 6 });
        request(app.getHttpServer())
          .post('/auth/verify-2fa')
          .set('Accept', 'application/json')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ token: twoFactAuthToken })
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
