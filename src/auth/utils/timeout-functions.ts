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

  setTimeout(userId: number, milliseconds: number, name: string): void {
    const callback = () => {
      this.userRepository.removeUserById(userId);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(name, timeout);
  }

  deleteTimeout(name: string): void {
    this.schedulerRegistry.deleteTimeout(name);
  }
}
