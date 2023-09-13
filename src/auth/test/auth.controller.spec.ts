import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthService } from '../__mocks__/auth.service.mock';
import { Role } from '@prisma/client';
import { AccountActivationTimeouts } from '../utils/timeout-functions';
import { MailModule } from '../../mail/mail.module';
import { SchedulerRegistry } from '@nestjs/schedule';
import { UserRepository } from '../../user/user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { ChangePasswordRequest } from '../dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, MailModule],
      providers: [
        AccountActivationTimeouts,
        SchedulerRegistry,
        UserRepository,
        PrismaService,
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
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
        role: Role.USER,
      });
    });
  });

  describe('Activate account', () => {
    it('should activate user account', async () => {
      //given
      const token = faker.string.sample(64);
      jest.spyOn(authService, 'activateAccount');

      //when
      await authController.activateAccount(token);

      //then
      expect(authService.activateAccount).toHaveBeenCalled();
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
});
