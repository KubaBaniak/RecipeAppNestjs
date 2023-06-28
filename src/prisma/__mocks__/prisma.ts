import { faker } from '@faker-js/faker';

class MockUserRequest {
  email: string;
  password: string;
  role?: string;
}

export class mockPrismaService {
  public user = {
    create: function (request: { data: MockUserRequest }) {
      return Promise.resolve({
        id: faker.number.int(),
        email: request.data.email,
        password: request.data.password,
        role: 'USER',
      });
    },
    update: function (request: {
      data: {
        email: string;
        password: string;
      };
      where: {
        id: number;
      };
    }) {
      return Promise.resolve({
        id: request.where.id,
        email: request.data.email,
        password: request.data.password,
        role: 'USER',
      });
    },

    delete: function (_request: { id: number }) {
      return Promise.resolve();
    },
  };
}
