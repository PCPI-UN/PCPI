import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { UserTokenRepositoryPort } from '@users/domain/repositories/user-token.repository.port';
import { UserToken, UserTokenType } from '@users/domain/entities/user-token.entity';
import { TransactionClient } from '@common/prisma/types/transaction-client.type';

@Injectable()
export class PrismaUserTokenRepository implements UserTokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(userToken: UserToken, tx?: TransactionClient): Promise<UserToken> {
    const prisma = tx ?? this.prisma;
    const createdToken = await prisma.userToken.create({
      data: {
        id: userToken.id,
        token: userToken.token,
        userId: userToken.userId,
        type: userToken.type,
        expiresAt: userToken.expiresAt,
        usedAt: userToken.usedAt,
      },
    });

    return new UserToken(
      createdToken.id,
      createdToken.token,
      createdToken.userId,
      createdToken.type as UserTokenType,
      createdToken.expiresAt,
      createdToken.usedAt,
    );
  }

  async findByToken(token: string): Promise<UserToken | null> {
    const foundToken = await this.prisma.userToken.findUnique({
      where: { token },
    });

    if (!foundToken) {
      return null;
    }

    return new UserToken(
      foundToken.id,
      foundToken.token,
      foundToken.userId,
      foundToken.type as UserTokenType,
      foundToken.expiresAt,
      foundToken.usedAt,
    );
  }

  async delete(token: string): Promise<void> {
    await this.prisma.userToken.delete({ where: { token } });
  }
}
