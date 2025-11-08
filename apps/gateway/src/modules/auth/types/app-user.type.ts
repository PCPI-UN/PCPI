export interface PlatformRole {
  id: number;
  name: string;
  scope: string;
}

export interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  status: string;
  platformRoles: PlatformRole[];
  platformPermissions: string[];
}
