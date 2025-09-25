import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(user);

    // If the user has a real ID, we update. Otherwise, we create.
    if (user.id && user.id !== 0) {
      const updatedPrismaUser = await this.prisma.user.update({
        where: { id: user.id },
        data: persistenceData,
      });
      return UserMapper.toDomain(updatedPrismaUser);
    }

    // For creation, we strip the 'id' so the database can generate it.
    const { id, ...createData } = persistenceData;
    const newPrismaUser = await this.prisma.user.create({
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

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany();
    return prismaUsers.map(UserMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { active: false } });
    return;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { username } });
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