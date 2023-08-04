import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Recipe } from '@prisma/client';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class WebsocketService {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('notification')
  handleCreation(@MessageBody() recipe: Recipe) {
    if (recipe.isPublic) {
      this.server.emit('notification', {
        msg: 'New has been created Recipe',
        content: recipe.title,
      });
    }
  }
}
