import { RoleDto } from './invitation-with-roles-response.dto';

export class GetInvitationByTokenWithRolesResponseDto {
  email: string;
  userStatus: string;
  firstName?: string;
  lastName?: string;
  roles: RoleDto[];
}
