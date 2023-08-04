import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ICreateRecipeNotification } from '../recipe/dto';

@Injectable()
@WebSocketGateway()
export class WebsocketService {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('notification')
  handleRecipeCreation(
    @MessageBody() notificationData: ICreateRecipeNotification,
  ) {
    if (notificationData.isPublic) {
      const all_listeners = this.server.sockets.sockets;
      const message = {
        msg: 'New has been created Recipe',
        content: notificationData.title,
      };
      all_listeners.forEach((listener) => {
        listener.emit('notification', message);
      });
    }
  }
}
