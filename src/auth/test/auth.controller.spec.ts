import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthService } from '../__mocks__/auth.service.mock';
import { Role } from '@prisma/client';
import { ChangePasswordRequest } from '../dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('SignIn', () => {
    it('should sign in / authenticate user', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      //when
      const accessToken = await authController.signIn(request);

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
      const signedUpUser = await authController.signUp(request);

      //then
      expect(signedUpUser).toEqual({
        id: expect.any(Number),
        email: request.email,
        enabled2FA: false,
        role: Role.USER,
      });
    });
  });

  describe('Change password', () => {
    it('should change password', async () => {
      //given
      const request: ChangePasswordRequest = {
        newPassword: faker.internet.password(),
      };
      const userId = faker.number.int();
      jest.spyOn(authService, 'changePassword');
      const changePasswordRequestDto = plainToInstance(
        ChangePasswordRequest,
        request,
      );

      //when
      const errors = await validate(changePasswordRequestDto);
      await authController.changePassword(userId, request);

      //then
      expect(errors).toHaveLength(0);
      expect(authService.changePassword).toBeCalled();
    });
  });

  describe('QR code for 2FA', () => {
    it('should create QR code', async () => {
      const userId = faker.number.int();

      const responseObject = await authController.createQrcodeFor2FA(userId);

      expect(responseObject).toHaveProperty('qrcodeUrl');
      expect(typeof responseObject.qrcodeUrl).toBe('string');
      expect(responseObject).toHaveProperty('urlToEnable2FA');
    });
  });

  describe('Enable 2FA', () => {
    it('should enable 2FA', async () => {
      const userId = faker.number.int();
      const tokenData = { token: faker.string.numeric(6) };

      const responseObject = await authController.enable2FA(userId, tokenData);

      expect(responseObject.recoveryKeys).toHaveLength(3);
      responseObject.recoveryKeys.forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });
  });

  describe('Disable 2FA', () => {
    it('should disable 2FA', async () => {
      const userId = faker.number.int();
      jest.spyOn(authService, 'disable2FA');

      authController.disable2FA(userId);

      expect(authService.disable2FA).toHaveBeenCalled();
    });
  });

  describe('Verify 2FA', () => {
    it('should verify 2FA', async () => {
      const userId = faker.number.int();
      const tokenData = { token: faker.string.numeric(6) };

      const responseObject = await authController.verify2FA(userId, tokenData);

      expect(typeof responseObject.accessToken).toBe('string');
    });
  });

  describe('Recovery keys 2FA', () => {
    it('should recover an account with recovery key', async () => {
      const userId = faker.number.int();
      const tokenData = { recoveryKey: faker.string.numeric(6) };

      const responseObject = await authController.recoverAccountWith2FA(
        userId,
        tokenData,
      );

      expect(typeof responseObject.accessToken).toBe('string');
    });
  });
});
