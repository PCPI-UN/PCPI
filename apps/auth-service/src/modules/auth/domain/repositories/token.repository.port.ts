import { Token } from '@auth/domain/entities/token.entity';

export abstract class TokenRepositoryPort {
  abstract save(token: Token): Promise<Token>;
  abstract findByToken(token: string): Promise<Token | null>;
  abstract deleteByUserId(userId: number): Promise<void>;
}
