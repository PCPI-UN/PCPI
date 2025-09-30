import { User } from '../entities/user.entity';
import { TransactionClient } from '@common/prisma/types/transaction-client.type';

export interface PaginatedUsersResult {
  users: User[];
  total: number;
}

export abstract class UserRepositoryPort {
  abstract save(user: User, tx?: TransactionClient): Promise<User>;
  abstract findById(id: number): Promise<User | null>;
  abstract findAll(options?: {
    page: number;
    limit: number;
    includeInactive?: boolean;
  }): Promise<PaginatedUsersResult>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByPhone(phone: string): Promise<boolean>;
  abstract deactivate(id: number): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
}