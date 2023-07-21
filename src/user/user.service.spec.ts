import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { MockPrismaService } from '../prisma/__mocks__/prisma.service.mock';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        UserRepository,
        { provide: PrismaService, useClass: MockPrismaService },
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
      expect(createdUser).toEqual({
        id: expect.any(Number),
        email: request.email,
        role: 'USER',
      });
    });
  });

  describe('UpdateUser', () => {
    it('should update User', async () => {
      //given
      const id = faker.number.int();
      const data = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      //when
      const createdUser = await userService.updateUser({ id, data });

      //then
      expect(createdUser).toEqual({
        id,
        email: data.email,
        role: 'USER',
      });
    });
  });

  describe('DeleteUser', () => {
    it('should delete User', async () => {
      //given
      const id = faker.number.int();

      //when
      const deletedUser = await userService.deleteUser(id);

      //then
      expect(deletedUser).toBeUndefined();
    });
  });
});
