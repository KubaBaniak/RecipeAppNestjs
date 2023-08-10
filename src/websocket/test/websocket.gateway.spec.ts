import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from '../notification.gateway';
import { faker } from '@faker-js/faker';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from 'src/user/user.repository';
import { JwtService } from '@nestjs/jwt';

describe('Websocket', () => {
  let notificationGateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        AuthService,
        UserRepository,
        JwtService,
        PrismaService,
      ],
    }).compile();

    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  describe('Notification', () => {
    let isPublic: boolean;
    const authorId = faker.number.int();
    const title = 'test_title';
    it('should send notification about new recipe when it is public', () => {
      //given
      isPublic = true;
      jest
        .spyOn(NotificationGateway.prototype, 'sendRecipeNotification')
        .mockImplementation((_message: string) => {
          return true;
        });

      //when
      notificationGateway.newRecipeEvent(title, isPublic, authorId);

      //then
      expect(notificationGateway.sendRecipeNotification).toHaveBeenCalled();
      jest.resetAllMocks();
    });

    it('should not send notification about new recipe when it is public', () => {
      //given
      isPublic = false;

      //when
      notificationGateway.newRecipeEvent(title, isPublic, authorId);

      //then
      expect(notificationGateway.sendRecipeNotification).not.toHaveBeenCalled();
    });
  });
});
