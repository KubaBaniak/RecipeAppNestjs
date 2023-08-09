import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;

  getNotificationRoomName(): string {
    return `recipe-notification-room`;
  }

  @SubscribeMessage('room')
  joinRoom(@ConnectedSocket() client: Socket): void {
    client.join(this.getNotificationRoomName());
  }

  sendRecipeNotification(message: string): boolean {
    return this.server.emit('notification', message);
  }

  newRecipeEvent(title: string, isPublic: boolean): void {
    if (isPublic) {
      const message = `New recipe: ${title.toUpperCase()} has been created`;
      this.sendRecipeNotification(message);
    }
  }
}
