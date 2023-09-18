import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { MailModule } from '../../mail/mail.module';
import { MailService } from '../../mail/mail.service';
import { MockAuthService } from '../__mocks__/auth.service.mock';
import { PrismaService } from '../../prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../user/user.repository';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  ChangePasswordRequest,
  ResetPasswordEmailRequest,
  ResetPasswordRequest,
} from '../dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController, MailModule],
      providers: [
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
    mailService = module.get<MailService>(MailService);
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
      });
    });
  });

  describe('Change password', () => {
    it('should change password', async () => {
      //given
      const request: ChangePasswordRequest = {
        newPassword: faker.internet.password({ length: 64 }),
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

  describe('Reset password', () => {
    it('should send email with link to reset password', async () => {
      const request: ResetPasswordEmailRequest = {
        email: faker.internet.email(),
      };
      jest.spyOn(authService, 'generateResetPasswordToken');
      jest.spyOn(mailService, 'sendResetPasswordEmail');

      await authController.resetPasswordEmail(request);

      expect(authService.generateResetPasswordToken).toHaveBeenCalled();
      expect(mailService.sendResetPasswordEmail).toHaveBeenCalled();
    });
  });

  it('should change password for the provided one via form', async () => {
    const userId = faker.number.int();
    const request: ResetPasswordRequest = {
      newPassword: faker.internet.password({ length: 64 }),
    };
    jest.spyOn(authService, 'changePassword');

    const resetPasswordRequestDto = plainToInstance(
      ResetPasswordRequest,
      request,
    );

    const errors = await validate(resetPasswordRequestDto);
    await authController.resetPassword(userId, request);

    expect(errors).toHaveLength(0);
    expect(authService.changePassword).toBeCalled();
  });
});
