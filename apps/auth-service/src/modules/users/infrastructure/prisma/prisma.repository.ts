import { Injectable } from '@nestjs/common';
import { User } from '@users/domain/entities/user.entity';
import {
  PaginatedUsersResult,
  UserRepositoryPort,
} from '@users/domain/repositories/user.repository.port';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';
import { TransactionClient } from '@common/prisma/types/transaction-client.type';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User, tx?: TransactionClient): Promise<User> {
    const prisma = tx ?? this.prisma;
    const persistenceData = UserMapper.toPersistence(user);

    // If the user has a real ID, we update. Otherwise, we create.
    if (user.id && user.id !== 0) {
      const updatedPrismaUser = await prisma.user.update({
        where: { id: user.id },
        data: persistenceData,
      });
      return UserMapper.toDomain(updatedPrismaUser);
    }

    const { id, ...createData } = persistenceData;
    const newPrismaUser = await prisma.user.create({
      data: createData,
    });
    return UserMapper.toDomain(newPrismaUser);
  }

  async findById(id: number): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { id } });
    if (!prismaUser) {
      return null;
    }
    return UserMapper.toDomain(prismaUser);
  }

  async findAll(options?: {
    page: number;
    limit: number;
    includeInactive?: boolean;
  }): Promise<PaginatedUsersResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit;
    const skip = limit ? (page - 1) * limit : 0;
    const includeInactive = options?.includeInactive ?? false;

    const whereClause = !includeInactive ? { active: true } : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: whereClause,
      }),
    ]);

    return {
      users: users.map(UserMapper.toDomain),
      total,
    };
  }

  async deactivate(id: number): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { active: false } });
    return;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    if (!phone) return false;
    const count = await this.prisma.user.count({ where: { phone } });
    return count > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({ where: { email } });
    if (!prismaUser) {
      return null;
    }
    return UserMapper.toDomain(prismaUser);
  }
}