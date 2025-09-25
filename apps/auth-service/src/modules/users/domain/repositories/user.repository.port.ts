import { User } from '../entities/user.entity';

export abstract class UserRepositoryPort {
  abstract save(user: User): Promise<User>;
  abstract findById(id: number): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract existsByUsername(username: string): Promise<boolean>;
  abstract existsByPhone(phone: string): Promise<boolean>;
  abstract delete(id: number): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
}