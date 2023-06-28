import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { mockPrismaService } from '../prisma/__mocks__/prisma';

describe('UserService', () => {
  let userService: UserService;

  const userPayload = {
    id: expect.any(Number),
    email: expect.any(String),
    password: expect.any(String),
    role: expect.any(String),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useClass: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('CreateUser', () => {
    it('should create default User', async () => {
      //given
      const request = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      //when
      const createdUser = await userService.createUser(request);

      //then
      expect(createdUser).toEqual(userPayload);
    });
  });

  describe('UpdateUser', () => {
    it('should update User', async () => {
      //given
      const where = {
        id: faker.number.int(),
      };
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      //when
      const createdUser = await userService.updateUser({
        data,
        where,
      });

      //then
      expect(createdUser).toEqual(userPayload);
    });
  });

  describe('DeleteUser', () => {
    it('should delete User', async () => {
      //given
      const where = {
        id: faker.number.int(),
      };

      //when
      const deletedUser = await userService.deleteUser(where);

      //then
      expect(deletedUser).toBeUndefined();
    });
  });
});
