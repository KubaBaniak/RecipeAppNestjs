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
import { SchedulerRegistry } from '@nestjs/schedule';

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
        SchedulerRegistry,
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
        .spyOn(userRepository, 'getUserByEmailWithPassword')
        .mockImplementation((email) => {
          return Promise.resolve({
            id: faker.number.int(),
            email,
            password: request.password,
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
        activated: false,
        email: request.email,
        password: undefined,
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
      jest
        .spyOn(userRepository, 'getUserByEmailWithPassword')
        .mockImplementation(() => {
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

  describe('Generace account activation token', () => {
    it('should generate token for account activation and register a timeout.', async () => {
      //given
      const userId = faker.number.int({ max: 2147483647 });

      //when
      const token = await authService.generateAccountActivationToken(userId);

      //then
      expect(typeof token).toBe('string');
    });
  });

  describe('Account activation ', () => {
    it('should activate an account and delete scheduled accout deletion timeout.', async () => {
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
});
