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
import { bcryptConstants } from '../constants';
import { UserRepository } from '../../user/user.repository';
import { PersonalAccessTokenRepository } from '../personal-access-token.repository';

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

      const hashed_password = await bcrypt.hash(
        request.password,
        bcryptConstants.salt,
      );

      jest.spyOn(userRepository, 'getUserByEmail').mockImplementation(() => {
        return Promise.resolve({
          id: faker.number.int(),
          email: request.email,
          password: hashed_password,
          role: Role.USER,
        });
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

      //when
      const signedUpUser = await authService.signUp(request);

      //then
      expect(signedUpUser).toEqual({
        id: expect.any(Number),
        email: request.email,
        password: expect.any(String),
        accountActivationToken: expect.any(String),
        createdAt: expect.any(Date),
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
        role: expect.any(String),
      });
    });
  });

  describe('Change password', () => {
    it('should change password', async () => {
      //given
      const userId = faker.number.int({ max: 2 ** 31 - 1 });
      const newPassword = faker.internet.password();
      jest.spyOn(userRepository, 'updateUserById');

      //when
      await authService.changePassword(userId, newPassword);

      //then
      expect(userRepository.updateUserById).toHaveBeenCalled();
    });
  });

  describe('Account activation ', () => {
    it('should delete non-activated account and create activated one with same data', async () => {
      //given
      const userId = faker.number.int({ max: 2147483647 });

      //when
      const user = await authService.activateAccount(userId);

      //then
      expect(user).toBeDefined();
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

  describe('Reset password', () => {
    it('should generate password reset token', async () => {
      //given
      const email = faker.internet.email();

      jest.spyOn(userRepository, 'getUserByEmail').mockImplementationOnce(() =>
        Promise.resolve({
          id: faker.number.int(),
          email,
          password: faker.internet.password(),
          role: Role.USER,
          activated: false,
          accountActivationToken: null,
        }),
      );

      //when
      const token = await authService.generateResetPasswordToken(email);

      //then
      expect(typeof token).toBe('string');
    });
  });
});
