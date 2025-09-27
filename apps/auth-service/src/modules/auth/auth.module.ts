import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@common/prisma/prisma.module';
import { UsersModule } from '@users/users.module';

// Application Layer
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.use-case';
import { TokenServicePort } from '@auth/application/ports/token.service.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { SetPasswordUseCase } from '@auth/application/use-cases/set-password.use-case';
import { ValidateTokenUseCase } from '@auth/application/use-cases/validate-token.use-case';

// Infrastructure Layer
import { JwtServiceAdapter } from '@auth/infrastructure/jwt/jwt.service.adapter';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { PrismaTokenRepository } from '@auth/infrastructure/prisma/prisma-token.repository';
import { BcryptAdapter } from '@common/hash/bcrypt.adapter';

// Interface Layer
import { AuthController } from '@auth/interface/grpc/auth.controller';

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    SetPasswordUseCase,
    ValidateTokenUseCase,
    {
      provide: TokenServicePort,
      useClass: JwtServiceAdapter,
    },
    {
      provide: TokenRepositoryPort,
      useClass: PrismaTokenRepository,
    },
    {
      provide: PasswordHasherPort,
      useClass: BcryptAdapter,
    },
  ],
})
export class AuthModule {}
