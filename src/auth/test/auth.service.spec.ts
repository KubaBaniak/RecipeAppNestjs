import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { MockJwtService } from '../__mocks__/jwt.service.mock';
import { bcryptConstants, numberOf2faRecoveryTokens } from '../constants';
import { UserRepository } from '../../user/user.repository';
import { PersonalAccessTokenRepository } from '../personal-access-token.repository';
import { MockPrismaService } from '../../prisma/__mocks__/prisma.service.mock';
import { authenticator } from 'otplib';
import { TwoFactorAuthRepository } from '../twoFactorAuth.repository';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let twoFactorAuthRepository: TwoFactorAuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        TwoFactorAuthRepository,
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
    twoFactorAuthRepository = module.get<TwoFactorAuthRepository>(
      TwoFactorAuthRepository,
    );
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
      const qrcode = await authService.createQrcodeFor2fa(userId);

      //then
      expect(typeof qrcode).toBe('string');
    });
  });

  describe('Enable 2fa', () => {
    it('should enable 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      jest.spyOn(authenticator, 'check').mockImplementationOnce(() => true);
      jest
        .spyOn(twoFactorAuthRepository, 'is2faEnabledForUserWithId')
        .mockImplementationOnce(() => {
          return Promise.resolve({
            isEnabled: false,
          });
        });

      const recoveryKeys = await authService.enable2fa(userId, token);

      expect(recoveryKeys).toHaveLength(numberOf2faRecoveryTokens);
      recoveryKeys.forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });
  });

  describe('Disable 2fa', () => {
    it('should disable 2fa', async () => {
      const userId = faker.number.int();
      jest
        .spyOn(twoFactorAuthRepository, 'is2faEnabledForUserWithId')
        .mockImplementationOnce(() => {
          return Promise.resolve({
            isEnabled: true,
          });
        });

      const twoFactorAuthData = await authService.disable2fa(userId);

      expect(typeof twoFactorAuthData.id).toBe('number');
      expect(typeof twoFactorAuthData.userId).toBe('number');
      expect(typeof twoFactorAuthData.secretKey).toBe('string');
    });
  });

  describe('Verify 2fa', () => {
    it('should verify 2fa', async () => {
      const userId = faker.number.int();
      const token = faker.string.numeric(6);
      jest.spyOn(authenticator, 'check').mockImplementationOnce(() => true);

      const loginToken = await authService.verify2fa(userId, token);

      expect(typeof loginToken).toBe('string');
    });
  });
});
