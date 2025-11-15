export interface PlatformRole {
  id: number;
  name: string;
  scope: string;
  description: string;
}

export interface IsPlatformStaffResult {
  isPlatformStaff: boolean;
  role?: PlatformRole;
}

export abstract class AuthClientPort {
  abstract isPlatformStaff(userId: number): Promise<IsPlatformStaffResult>;
}
