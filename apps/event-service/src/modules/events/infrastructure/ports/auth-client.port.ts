import {
  IsPlatformStaffResponse,
  GetRolesByIdsResponse,
  User
} from "@app/common/generated/auth"

export abstract class AuthClientPort {
  abstract isPlatformStaff(userId: number): Promise<IsPlatformStaffResponse>;
  abstract getRolesByIds(roleIds: number[]): Promise<GetRolesByIdsResponse>;
  abstract getUser(userId: number): Promise<User>;
}
