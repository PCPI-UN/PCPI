import { User as PrismaUser, UserStatus as PrismaUserStatus } from '@prisma/client';
import { User, UserStatus } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.firstName,
      prismaUser.lastName ?? '',
      prismaUser.email,
      prismaUser.password,
      prismaUser.phone ?? '',
      prismaUser.active,
      prismaUser.status as UserStatus,
    );
  }

  static toPersistence(domainUser: User) {
    return {
      id: domainUser.id,
      firstName: domainUser.firstName,
      lastName: domainUser.lastName,
      email: domainUser.email,
      password: domainUser.password,
      phone: domainUser.phone,
      active: domainUser.active,
      status: domainUser.status as PrismaUserStatus,
    };
  }
}
