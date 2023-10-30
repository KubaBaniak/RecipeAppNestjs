import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketEventGateway } from '../websocket-event.gateway';
import { faker } from '@faker-js/faker';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from '../../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { PendingUsersRepository } from '../../user/pending-user.repository';

describe('Websocket', () => {
  let webSocketEventGateway: WebSocketEventGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketEventGateway,
        AuthService,
        PendingUsersRepository,
        UserRepository,
        JwtService,
        PrismaService,
      ],
    }).compile();

    webSocketEventGateway = module.get<WebSocketEventGateway>(
      WebSocketEventGateway,
    );
  });

  describe('Notification', () => {
    let isPublic: boolean;
    const authorId = faker.number.int();
    const title = 'test_title';
    it('should send notification about new recipe when it is public', () => {
      //given
      isPublic = true;
      jest
        .spyOn(WebSocketEventGateway.prototype, 'sendRecipeNotification')
        .mockImplementation((_message: string) => {
          return true;
        });

      //when
      webSocketEventGateway.newRecipeEvent(title, isPublic, authorId);

      //then
      expect(webSocketEventGateway.sendRecipeNotification).toHaveBeenCalled();
      jest.resetAllMocks();
    });

    it('should not send notification about new recipe when it is public', () => {
      //given
      isPublic = false;

      //when
      webSocketEventGateway.newRecipeEvent(title, isPublic, authorId);

      //then
      expect(
        webSocketEventGateway.sendRecipeNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
