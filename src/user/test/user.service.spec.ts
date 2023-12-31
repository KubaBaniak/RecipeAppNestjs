import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { MockPrismaService } from '../../prisma/__mocks__/prisma.service.mock';
import { createUser } from './user.factory';
import { UserRepository } from '../user.repository';

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
      const { email } = createUser();
      const password = faker.internet.password({ length: 64 });

      //when
      const createdUser = await userService.createUser({ email, password });

      //then
      expect(createdUser).toEqual({
        id: expect.any(Number),
        email,
      });
    });
  });

  describe('UpdateUser', () => {
    it('should update User', async () => {
      //given
      const id = faker.number.int();
      const data = createUser();

      //when
      const createdUser = await userService.updateUser({ id, data });

      //then
      expect(createdUser).toEqual({
        id,
        email: data.email,
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
