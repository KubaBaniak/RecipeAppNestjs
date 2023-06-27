import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;

  const mockAuthService = {
    signIn: jest
      .fn()
      .mockImplementation((_request: { email: string; password: string }) => {
        return Promise.resolve({
          accessToken: faker.string.sample(64),
        });
      }),

    signUp: jest
      .fn()
      .mockImplementation((request: { email: string; password: string }) => {
        return Promise.resolve({
          id: faker.number.int(),
          email: request.email,
          role: 'USER',
        });
      }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
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
      expect(signedUpUser).toBeDefined();
    });
  });
});
