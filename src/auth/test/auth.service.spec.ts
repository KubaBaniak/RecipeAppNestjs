import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { MockJwtService } from '../__mocks__/jwt.service.mock';
import { bcryptConstants } from '../constants';
import { UserRepository } from '../../user/user.repository';
import { PersonalAccessTokenRepository } from '../personal-access-token.repository';
import { MockPrismaService } from '../../prisma/__mocks__/prisma.service.mock';
import { authenticator } from 'otplib';
import { createUserResponse } from 'src/user/test/user.factory';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        UserRepository,
        PersonalAccessTokenRepository,
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

      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockImplementation((email) => {
          return Promise.resolve({
            id: faker.number.int(),
            email,
            password: request.password,
            twoFactorAuth: null,
            role: Role.USER,
          });
        });
      //when
      const accessToken = authService.signIn(request);

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

      //when
      const signedUpUser = await authService.signUp(request);

      //then
      expect(signedUpUser).toEqual({
        id: expect.any(Number),
        email: request.email,
        role: Role.USER,
      });
    });
  });

  describe('ValidateUser', () => {
    it('should validate user', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const hashed_password = await bcrypt.hash(
        request.password,
        bcryptConstants.salt,
      );
      jest.spyOn(userRepository, 'getUserByEmail').mockImplementation(() => {
        return Promise.resolve({
          id: faker.number.int(),
          email: faker.internet.email(),
          password: hashed_password,
          twoFactorAuth: null,
          role: Role.USER,
        });
      });

      //when
      const validatedUser = await authService.validateUser(request);

      //then
      expect(validatedUser).toEqual({
        id: expect.any(Number),
        email: expect.any(String),
        password: expect.any(String),
        twoFactorAuth: null,
        role: expect.any(String),
      });
    });
  });

  describe('Change password', () => {
    it('should change password', async () => {
      //given
      const userId = faker.number.int({ max: 2 ** 31 - 1 });
      const newPassword = faker.internet.password();
      const spy = jest.spyOn(userRepository, 'updateUserById');

      //when
      await authService.changePassword(userId, newPassword);

      //then
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Create qrcode', () => {
    it('should change password', async () => {
      //given
      const userId = faker.number.int();

      //when
      const qrcode = await authService.createQrcodeFor2FA(userId);

      //then
      expect(typeof qrcode).toBe('string');
    });
  });

  describe('Enable 2fa', () => {
    it('should enable 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      jest.spyOn(authenticator, 'check').mockImplementationOnce(() => true);

      const recoveryKeys = await authService.enable2FA(userId, token);

      expect(recoveryKeys).toHaveLength(3);
      recoveryKeys.forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });
  });

  describe('Disable 2fa', () => {
    it('should disable 2fa', async () => {
      const userId = faker.number.int();

      const user = await authService.disable2FA(userId);

      expect(user.enabled2FA).toBe(false);
    });
  });

  describe('Verify 2fa', () => {
    it('should verify 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      jest.spyOn(authenticator, 'check').mockImplementationOnce(() => true);

      const loginToken = await authService.verify2FA(userId, token);

      expect(typeof loginToken).toBe('string');
    });
  });

  describe('Recover an account with recovery tokens from 2fa', () => {
    it('should log in with recovery keys', async () => {
      const userId = faker.number.int();
      const recoveryKey = faker.string.numeric(6);
      const recoveryKeysOfUser = Array.from({ length: 3 }, () =>
        faker.string.alphanumeric(16),
      );
      recoveryKeysOfUser[0] = recoveryKey;

      jest
        .spyOn(userRepository, 'get2FARecoveryKeysAndEmailByUserId')
        .mockImplementationOnce(async () =>
          Promise.resolve(
            createUserResponse({
              enabled2FA: true,
              recoveryKeys: recoveryKeysOfUser,
            }),
          ),
        );

      const loginToken = await authService.recoverAccountWith2FA(
        userId,
        recoveryKey,
      );

      expect(typeof loginToken).toBe('string');
    });
  });
});
