import { UserToken } from '@users/domain/entities/user-token.entity';
import { PrismaService } from '@common/prisma/prisma.service';

type TransactionClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export abstract class UserTokenRepositoryPort {
  abstract save(userToken: UserToken, tx?: TransactionClient): Promise<UserToken>;
  abstract findByToken(token: string): Promise<UserToken | null>;
  abstract delete(token: string): Promise<void>;
}
