export class RoleDto {
  id: number;
  name: string;
  description: string;
  scope: string;
}

export class InvitationWithRolesResponseDto {
  id: string;
  token: string;
  email: string;
  targetType: number;
  targetId: number;
  status: number;
  expiresAt: string;
  invitedByUserId: number;
  invitedUserId: number;
  roles: RoleDto[];
  createdAt: string;
}
