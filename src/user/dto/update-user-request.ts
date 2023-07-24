import { Role } from '@prisma/client';

export interface UpdateUserRequest {
  id: number;
  data: {
    email?: string;
    password?: string;
    role?: Role;
  };
}
