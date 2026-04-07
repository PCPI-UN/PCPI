export const AUTH_SERVICE_PORT = 'AUTH_SERVICE_PORT';

export interface UserBasicInfo {
  id: number;
  firstName: string;
  lastName?: string | null;
  email: string;
}

export interface AuthServicePort {
  getUserById(id: number): Promise<UserBasicInfo | null>;
}
