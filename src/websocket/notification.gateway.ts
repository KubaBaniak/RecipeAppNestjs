import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserRepository } from '../user/user.repository';

@Injectable()
@WebSocketGateway()
export class NotificationGateway {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}

  @WebSocketServer()
  server: Server;

  getRoomWithId(userId: number): string {
    return `notification-userId-${userId}`;
  }

  async handleConnection(socket: Socket) {
    const token: string =
      socket.handshake.headers['authorization'].split(' ')[1];
    try {
      const decodedToken = await this.authService.verifyJwt(token);
      const user = await this.userRepository.getUserById(decodedToken.id);

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
