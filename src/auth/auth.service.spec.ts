import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  class MockRequest {
    email: string;
    password: string;
  }

  const mockJwtService = {
    signAsync: jest.fn().mockImplementation((_request) => {
      return Promise.resolve(faker.string.sample(64));
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UserService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    jest.clearAllMocks();
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('SignIn', () => {
    it('should return access token', async () => {
      //given
      const request: MockRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      //when
      const accessToken = authService.signIn(request);

      //then
      expect(accessToken).toBeDefined();
    });
  });

  describe('SignUp', () => {
    it('should sign up user', async () => {
      //given
      const request: MockRequest = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(userService, 'createUser').mockImplementation((request) => {
        return Promise.resolve({
          id: faker.number.int(),
          email: request.email,
          password: request.password,
          role: 'USER',
        });
      });

      //when
      const signedUpUser = await authService.signUp(request);

      //then
      expect(signedUpUser).toEqual({
        id: expect.any(Number),
        email: expect.any(String),
        password: expect.any(String),
        role: expect.any(String),
      });
    });
  });

  describe('ValidateUser', () => {
    it('should validate user', async () => {
      //given
      const request: MockRequest = {
        email: faker.internet.email(),
        password: 'john cena',
      };

      const hashed_password = await bcrypt.hash(request.password, 7);
      const result = Promise.resolve({
        id: faker.number.int(),
        email: faker.internet.email(),
        password: hashed_password,
        role: Role.USER,
      });

      jest.spyOn(userService, 'findOneUser').mockImplementation(() => result);

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
