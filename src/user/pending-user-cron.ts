import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { PendingUsersRepository } from './pending-user.repository';

@Injectable()
export class PendingUserDeletionCronService {
  constructor(
    private readonly pendingUsersRepository: PendingUsersRepository,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'pendingUsers',
    timeZone: 'Europe/Paris',
  })
  async pendingUserDeletion() {
    const currentTime = new Date().getTime();
    const pendingUsers = await this.pendingUsersRepository.getAllPendingUsers();

    pendingUsers.forEach(async (pendingUser) => {
      const deletionTime =
        pendingUser.createdAt.getTime() + 24 * 60 * 60 * 1000;

      if (currentTime > deletionTime) {
        await this.pendingUsersRepository.removePendingUserById(pendingUser.id);
      }
    });
  }
}
