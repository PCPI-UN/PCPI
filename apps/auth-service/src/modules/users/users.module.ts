import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '@users/application/use-cases/create-user.use-case';
import { UserRepositoryPort } from '@users/domain/repositories/user.repository.port';
import { PrismaUserRepository } from '@users/infrastructure/prisma/prisma.repository';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { BcryptAdapter } from '@common/hash/bcrypt.adapter';
import { UsersController } from '@users/interface/grpc/users.controller';
import { PrismaModule } from '@common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    {
      provide: UserRepositoryPort,
      useClass: PrismaUserRepository,
    },
    {
      provide: PasswordHasherPort,
      useClass: BcryptAdapter,
    },
  ],
  exports: [
    CreateUserUseCase,
    UserRepositoryPort,
  ],
})
export class UsersModule {}
