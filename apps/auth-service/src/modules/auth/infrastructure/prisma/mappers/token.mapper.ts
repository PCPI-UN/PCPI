import { UserToken as PrismaUserToken } from '@prisma/client';
import { Token, TokenType } from '@auth/domain/entities/token.entity';

export class TokenMapper {
  static toDomain(prismaToken: PrismaUserToken): Token {
    return new Token(
      prismaToken.id,
      prismaToken.token,
      prismaToken.userId,
      prismaToken.type as TokenType,
      prismaToken.expiresAt,
      prismaToken.usedAt,
    );
  }

  static toPersistence(token: Token) {
    return {
      id: token.id,
      token: token.token,
      userId: token.userId,
      type: token.type,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
    };
  }
}
