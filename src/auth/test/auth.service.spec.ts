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
import { AccountActivationTimeouts } from '../utils/timeout-functions';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let personalAccessTokenRepository: PersonalAccessTokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        UserRepository,
        PersonalAccessTokenRepository,
        PrismaService,
        AccountActivationTimeouts,
        SchedulerRegistry,
        {
          provide: JwtService,
          useClass: MockJwtService,
        },
      ],
    }).compile();

    jest.clearAllMocks();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
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

      jest.spyOn(userRepository, 'createUser').mockImplementation((request) => {
        return Promise.resolve({
          id: faker.number.int(),
          email: request.email,
          role: Role.USER,
        });
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
});
