import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';
import { MockJwtService } from '../__mocks__/jwt.service.mock';
import { bcryptConstants } from '../constants';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        PrismaService,
        UserService,
        {
          provide: JwtService,
          useClass: MockJwtService,
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
      const request = {
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
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      jest.spyOn(userService, 'createUser').mockImplementation((request) => {
        return Promise.resolve({
          id: faker.number.int(),
          email: request.email,
          password: request.password,
          role: Role.USER,
        });
      });

      //when
      const signedUpUser = await authService.signUp(request);

      //then
      expect(signedUpUser).toEqual({
        id: expect.any(Number),
        password: expect.any(String),
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
        bcryptConstants.test_salt,
      );
      jest.spyOn(userService, 'findOneUser').mockImplementation(() => {
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
