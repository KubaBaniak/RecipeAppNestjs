import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { MockAuthService } from '../__mocks__/auth.service.mock';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let authController: AuthController;

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
});