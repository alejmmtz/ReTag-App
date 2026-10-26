import { UserRoleEnum } from './enums';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: UserRoleEnum;
  };
}
