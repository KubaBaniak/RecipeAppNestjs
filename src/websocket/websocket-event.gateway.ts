import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserRepository } from '../user/user.repository';
import {
  ClientProxy,
  RmqRecordBuilder,
  RpcException,
} from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
@WebSocketGateway()
export class WebSocketEventGateway {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @WebSocketServer()
  server: Server;

  getRoomWithId(userId: number): string {
    return `notification-userId-${userId}`;
  }

  async handleConnection(socket: Socket) {
    const token: string = socket.handshake.headers.authorization?.split(' ')[1];
    try {
      const validateJwtPayload = new RmqRecordBuilder({
        token,
      }).build();

      const userId: number = await firstValueFrom(
        this.authClient.send('create-2fa-qrcode', validateJwtPayload).pipe(
          catchError((err) => {
            throw new RpcException(err.response);
          }),
        ),
      );
      const user = await this.userRepository.getUserById(userId);

      if (!user) {
        return this.dissconnectOnAuth(socket);
      } else {
        this.addUserToNotificationRoom(socket, user.id);
      }
    } catch {
      throw new UnauthorizedException('Unauthorized. Invalid token');
    }
  }

  private dissconnectOnAuth(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  addUserToNotificationRoom(socket: Socket, userId: number): void {
    socket.join(this.getRoomWithId(userId));
  }

  sendRecipeNotification(message: string, authorId: number): boolean {
    return this.server
      .except(this.getRoomWithId(authorId))
      .emit('notification', message);
  }

  newRecipeEvent(title: string, isPublic: boolean, authorId: number): void {
    if (isPublic) {
      const message = `New recipe: ${title.toUpperCase()} has been created`;
      this.sendRecipeNotification(message, authorId);
    }
  }
}
