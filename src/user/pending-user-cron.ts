import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { PendingUserRepository } from './pending-user.repository';

@Injectable()
export class PendingUserDeletionCronService {
  constructor(private readonly pendingUserRepository: PendingUserRepository) {}

  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'pendingUsers',
    timeZone: 'Europe/Paris',
  })
  async pendingUserDeletion() {
    const currentTime = new Date().getTime();
    const pendingUsers = await this.pendingUserRepository.getAllPendingUsers();

    pendingUsers.forEach(async (pendingUser) => {
      const deletionTime =
        pendingUser.createdAt.getTime() + 24 * 60 * 60 * 1000;

      if (currentTime > deletionTime) {
        await this.pendingUserRepository.removePendingUserById(pendingUser.id);
      }
    });
  }
}
