import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { faker } from '@faker-js/faker';

describe('UserService', () => {
  let userService: UserService;

  const mockUser = {
    id: expect.any(Number),
    email: expect.any(String),
    password: expect.any(String),
    role: expect.any(String),
  };

  class MockUserRequest {
    email: string;
    password: string;
    role?: string;
  }

  const mockPrismaService = {
    user: {
      create: jest
        .fn()
        .mockImplementation((request: { data: MockUserRequest }) => {
          return Promise.resolve({
            id: faker.number.int(),
            email: request.data.email,
            password: request.data.password,
            role: 'USER',
          });
        }),

      update: jest.fn().mockImplementation(
        (request: {
          data: {
            email: string;
            password: string;
          };
          where: {
            id: number;
          };
        }) => {
          return Promise.resolve({
            id: request.where.id,
            email: request.data.email,
            password: request.data.password,
            role: 'USER',
          });
        },
      ),

      delete: jest.fn().mockImplementation((_request: { id: number }) => {
        return Promise.resolve();
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
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
      expect(createdUser).toEqual(mockUser);
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
      expect(createdUser).toEqual(mockUser);
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
