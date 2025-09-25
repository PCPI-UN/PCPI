import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.firstName,
      prismaUser.lastName ?? '',
      prismaUser.email,
      prismaUser.username,
      prismaUser.password,
      prismaUser.phone ?? '',
      prismaUser.active,
    );
  }

  static toPersistence(domainUser: User) {
    return {
      id: domainUser.id,
      firstName: domainUser.firstName,
      lastName: domainUser.lastName,
      email: domainUser.email,
      username: domainUser.username,
      password: domainUser.password,
      phone: domainUser.phone,
      active: domainUser.active,
    };
  }
}
