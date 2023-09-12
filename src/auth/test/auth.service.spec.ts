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
import { AccountActivationTimeouts } from '../utils/timeout-functions';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let accountActivationTimeouts: AccountActivationTimeouts;
  let personalAccessTokenRepository: PersonalAccessTokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        UserRepository,
        PersonalAccessTokenRepository,
        AccountActivationTimeouts,
        SchedulerRegistry,
        {
          provide: AccountActivationTimeouts,
          useValue: {
            setTimeout: jest.fn(),
            getName: jest.fn(),
            deleteTimeout: jest.fn(),
          },
        },
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

    jest.clearAllMocks();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    accountActivationTimeouts = module.get<AccountActivationTimeouts>(
      AccountActivationTimeouts,
    );
    personalAccessTokenRepository = module.get<PersonalAccessTokenRepository>(
      PersonalAccessTokenRepository,
    );
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

      jest
        .spyOn(userRepository, 'getUserByEmailWithPassword')
        .mockImplementation((request) => {
          return null;
        });

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
      jest.spyOn(accountActivationTimeouts, 'setTimeout');

      //when
      const token = await authService.generateAccountActivationToken(userId);

      //then
      expect(typeof token).toBe('string');
      expect(accountActivationTimeouts.setTimeout).toHaveBeenCalled();
    });
  });

  describe('Account activation ', () => {
    it('should activate an account and delete scheduled accout deletion timeout.', async () => {
      //given
      const userId = faker.number.int({ max: 2147483647 });
      jest.spyOn(accountActivationTimeouts, 'deleteTimeout');

      //when
      const user = await authService.activateAccount(userId);

      //then
      expect(user.activated).toBe(true);
      expect(accountActivationTimeouts.deleteTimeout).toHaveBeenCalled();
    });
  });
});
