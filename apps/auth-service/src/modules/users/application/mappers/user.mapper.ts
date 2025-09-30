import {
  GetUsersResponse,
  User as UserProto,
} from '@app/common/generated/auth';
import { User } from '@users/domain/entities/user.entity';

export class UserMapper {
  static toCreateUserResponse(user: User): UserProto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      active: user.active,
      status: user.status,
    };
  }

  static toGetUserResponse(user: User): UserProto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      active: user.active,
      status: user.status,
    };
  }

  static toGetUsersResponse(paginatedResult: any): GetUsersResponse {
    return {
      users: paginatedResult.data.map((user: User) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        active: user.active,
        status: user.status,
      })),
      meta: paginatedResult.meta,
    };
  }
}
