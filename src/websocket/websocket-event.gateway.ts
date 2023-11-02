import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserRepository } from '../user/user.repository';
import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway()
export class WebSocketEventGateway {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  @WebSocketServer()
  server: Server;

  getRoomWithId(userId: number): string {
    return `notification-userId-${userId}`;
  }

  async handleConnection(socket: Socket) {
    const token: string = socket.handshake.headers.authorization?.split(' ')[1];
    try {
      const userId = await this.authService.validateAuthToken(token);
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
