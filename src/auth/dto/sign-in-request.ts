import { User } from '@prisma/client';

export class SignInRequest {
  user: User;
}
