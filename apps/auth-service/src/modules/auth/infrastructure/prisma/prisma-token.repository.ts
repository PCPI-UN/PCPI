import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { Token } from '@auth/domain/entities/token.entity';
import { TokenMapper } from './mappers/token.mapper';

@Injectable()
export class PrismaTokenRepository implements TokenRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(token: Token): Promise<Token> {
    const persistenceData = TokenMapper.toPersistence(token);
    const newPrismaToken = await this.prisma.userToken.create({
      data: persistenceData,
    });
    return TokenMapper.toDomain(newPrismaToken);
  }

  async findByToken(tokenValue: string): Promise<Token | null> {
    const prismaToken = await this.prisma.userToken.findUnique({
      where: { token: tokenValue },
    });
    return prismaToken ? TokenMapper.toDomain(prismaToken) : null;
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.userToken.deleteMany({
      where: { userId },
    });
  }
}
