import { Injectable, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ICreateRecipeNotification } from '../recipe/dto';
import { SocketCacheService } from './websocket-cache.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Injectable()
@WebSocketGateway()
export class WebsocketService {
  constructor(private readonly socketCacheService: SocketCacheService) {}

  @WebSocketServer()
  server: Server;

  handleConnection() {
    this.server.on('connection', (socket) => {
      console.log(socket);
      this.socketCacheService.cacheSocketId(socket.id);
    });
  }

  //@SubscribeMessage('notification')
  //handleRecipeCreation(
  //  @MessageBody() notificationData: ICreateRecipeNotification,
  //) {}
}
