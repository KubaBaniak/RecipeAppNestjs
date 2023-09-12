import { SchedulerRegistry } from '@nestjs/schedule';
import { UserRepository } from '../../user/user.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountActivationTimeouts {
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userRepository: UserRepository,
  ) {}

  getName(userId: number): string {
    return `account-activation-${userId}`;
  }

  async addTimeout(
    userId: number,
    milliseconds: number,
    name: string,
  ): Promise<void> {
    const callback = async () => {
      await this.userRepository.removeUserById(userId);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  deleteTimeout(name: string): void {
    this.schedulerRegistry.deleteTimeout(name);
  }

  getAllTimeouts(): string[] {
    return this.schedulerRegistry.getTimeouts();
  }
}
