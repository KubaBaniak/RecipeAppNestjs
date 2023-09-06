import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Injectable()
export class PendingUserDeletion {
  constructor(private readonly userRepository: UserRepository) {}

  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'pendingUsers',
    timeZone: 'Europe/Paris',
  })
  async pendingUserDeletion() {
    const currentTime = new Date().getTime();
    const pendingUsers = await this.userRepository.getAllPendingUsers();

    pendingUsers.forEach(async (pendingUser) => {
      const deletionTime =
        pendingUser.createdAt.getTime() + 24 * 60 * 60 * 1000;

      if (currentTime > deletionTime) {
        await this.userRepository.removePendingUserById(pendingUser.id);
      }
    });
  }
}
