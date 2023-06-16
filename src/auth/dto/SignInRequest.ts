import { User } from '@prisma/client';

export class SignInRequestDto {
  user: User;
}
