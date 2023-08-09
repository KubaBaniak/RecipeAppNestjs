import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGateway } from '../websocket.gateway';

describe('Websocket', () => {
  let websocketGateway: WebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsocketGateway],
    }).compile();

    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  describe('Notification', () => {
    let isPublic: boolean;
    const title = 'test_title';
    it('should send notification about new recipe when it is public', () => {
      //given
      isPublic = true;
      jest
        .spyOn(WebsocketGateway.prototype, 'sendRecipeNotification')
        .mockImplementation((_message: string) => {
          return isPublic;
        });

      //when
      websocketGateway.newRecipeEvent(title, isPublic);

      //then
      expect(websocketGateway.sendRecipeNotification).toHaveBeenCalled();
      jest.resetAllMocks();
    });

    it('should not send notification about new recipe when it is public', () => {
      //given
      isPublic = false;

      //when
      websocketGateway.newRecipeEvent(title, isPublic);

      //then
      expect(websocketGateway.sendRecipeNotification).not.toHaveBeenCalled();
    });
  });
});
