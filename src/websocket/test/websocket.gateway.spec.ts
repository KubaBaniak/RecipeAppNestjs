import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from '../notification.gateway';

describe('Websocket', () => {
  let notificationGateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
  });

  describe('Notification', () => {
    let isPublic: boolean;
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
      notificationGateway.newRecipeEvent(title, isPublic);

      //then
      expect(notificationGateway.sendRecipeNotification).toHaveBeenCalled();
      jest.resetAllMocks();
    });

    it('should not send notification about new recipe when it is public', () => {
      //given
      isPublic = false;

      //when
      notificationGateway.newRecipeEvent(title, isPublic);

      //then
      expect(notificationGateway.sendRecipeNotification).not.toHaveBeenCalled();
    });
  });
});
