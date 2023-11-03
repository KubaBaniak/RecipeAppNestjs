import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { MockPrismaService } from '../../prisma/__mocks__/prisma.service.mock';
import { Role } from '@prisma/client';
import { MockJwtService } from '../__mocks__/jwt.service.mock';
import { BCRYPT, NUMBER_OF_2FA_RECOVERY_TOKENS } from '../constants';
import { UserRepository } from '../../user/user.repository';
import { authenticator } from 'otplib';
import { PendingUsersRepository } from '../../user/pending-user.repository';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { mock } from 'jest-mock-extended';

const MAX_INT32 = 2147483647;

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let authClient: AmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        PendingUsersRepository,
        UserRepository,
        { provide: AmqpConnection, useValue: mock<AmqpConnection>() },
        {
          provide: PrismaService,
          useClass: MockPrismaService,
        },
        {
          provide: JwtService,
          useClass: MockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    authClient = module.get<AmqpConnection>(AmqpConnection);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('SignIn', () => {
    it('should return access token', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(authClient, 'request').mockResolvedValue({
        accessToken: faker.string.alphanumeric({ length: 64 }),
      });

      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue({
        id: faker.number.int(),
        email: request.email,
        role: Role.USER,
      });

      //when
      const accessToken = await authService.signIn(request);

      //then
      expect(accessToken).toBeDefined();
    });
  });

  describe('SignUp', () => {
    it('should sign up user', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const accountActivationToken = faker.string.alphanumeric({ length: 64 });
      jest.spyOn(authClient, 'request').mockResolvedValue({
        accountActivationToken,
      });

      //when
      const signUpResponse = await authService.signUp(request);

      //then
      expect(signUpResponse.email).toEqual(request.email);
      expect(signUpResponse.accountActivationToken).toEqual(
        accountActivationToken,
      );
    });
  });

  describe('ValidateUser', () => {
    it('should validate user', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
      const userId = faker.number.int();
      jest.spyOn(authClient, 'request').mockResolvedValue(userId);
      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue({
        id: faker.number.int(),
        email: faker.internet.email(),
        role: Role.USER,
      });

      //when
      const validatedUserId = await authService.validateUser(request);

      //then
      expect(validatedUserId).toEqual(userId);
    });
  });

  describe('Change password', () => {
    it('should change password', async () => {
      //given
      const userId = faker.number.int({ max: MAX_INT32 });
      const newPassword = faker.internet.password();
      jest.spyOn(authClient, 'request').mockResolvedValue(userId);

      //when
      const changedPasswordUserId = await authService.changePassword(
        userId,
        newPassword,
      );

      //then
      expect(changedPasswordUserId).toEqual(userId);
    });
  });

  describe('Reset password', () => {
    it('should generate password reset token', async () => {
      //given
      const email = faker.internet.email();
      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue({
        id: faker.number.int(),
        email,
        role: Role.USER,
      });
      const token = faker.string.alphanumeric({ length: 64 });
      jest.spyOn(authClient, 'request').mockResolvedValue(token);

      //when
      const generatedToken = await authService.generateResetPasswordToken(
        email,
      );

      //then
      expect(generatedToken).toEqual(token);
    });
  });

  describe('Create QR Code', () => {
    it('should create QR Code for 2FA', async () => {
      //given
      const userId = faker.number.int();
      const qrCodeUrl = faker.internet.url();
      jest.spyOn(authClient, 'request').mockResolvedValue({ qrCodeUrl });

      //when
      const qrCode = await authService.createQrCodeFor2fa(userId);

      //then
      expect(qrCode).toEqual(qrCodeUrl);
    });
  });

  describe('Generate 2FA recovery keys', () => {
    it('should generate recovery keys for 2FA', async () => {
      const userId = faker.number.int();
      const recoveryKeys = Array.from(
        { length: NUMBER_OF_2FA_RECOVERY_TOKENS },
        () => faker.string.alphanumeric(),
      );
      jest.spyOn(authClient, 'request').mockResolvedValue({ recoveryKeys });

      const generatedRecoveryKeys = await authService.generate2faRecoveryKeys(
        userId,
      );

      expect(generatedRecoveryKeys).toEqual(recoveryKeys);
    });
  });

  describe('Enable 2fa', () => {
    it('should enable 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      const recoveryKeys = Array.from(
        { length: NUMBER_OF_2FA_RECOVERY_TOKENS },
        () => faker.string.alphanumeric(),
      );
      jest.spyOn(authClient, 'request').mockResolvedValue({ recoveryKeys });

      const generatedRecoveryKeys = await authService.enable2fa(userId, token);

      expect(generatedRecoveryKeys).toEqual(recoveryKeys);
    });
  });

  describe('Disable 2fa', () => {
    it('should disable 2fa', async () => {
      const userId = faker.number.int();
      jest.spyOn(authClient, 'request').mockResolvedValue(userId);

      const userTwoFactorAuthId = await authService.disable2fa(userId);

      expect(userTwoFactorAuthId).toEqual(userId);
    });
  });

  describe('Verify 2fa', () => {
    it('should verify 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      const accessToken = faker.string.alphanumeric({ length: 64 });
      jest.spyOn(authClient, 'request').mockResolvedValue({ accessToken });

      const loginToken = await authService.verify2fa(userId, token);

      expect(loginToken).toEqual(accessToken);
    });
  });
});
