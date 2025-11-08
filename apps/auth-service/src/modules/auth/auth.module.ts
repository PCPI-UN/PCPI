import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PrismaModule } from '@common/prisma/prisma.module';
import { UsersModule } from '@users/users.module';
import {
  NOTIFICATION_SERVICE_NAME,
  protobufPackage as notificationProtobufPackage,
} from '@app/common/generated/notification';

// Application Layer
import { LoginUseCase } from '@auth/application/use-cases/login.use-case';
import { RefreshUseCase } from '@auth/application/use-cases/refresh.use-case';
import { TokenServicePort } from '@auth/application/ports/token.service.port';
import { PasswordHasherPort } from '@common/ports/password-hasher.port';
import { EmailServicePort } from '@common/ports/email-service.port';
import { SetPasswordUseCase } from '@auth/application/use-cases/set-password.use-case';
import { ValidateTokenUseCase } from '@auth/application/use-cases/validate-token.use-case';
import { ValidateJwtUseCase } from '@auth/application/use-cases/validate-jwt.use-case';
import { ForgotPasswordUseCase } from '@auth/application/use-cases/forgot-password.use-case';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.use-case';

// Infrastructure Layer
import { JwtServiceAdapter } from '@auth/infrastructure/jwt/jwt.service.adapter';
import { TokenRepositoryPort } from '@auth/domain/repositories/token.repository.port';
import { PrismaTokenRepository } from '@auth/infrastructure/prisma/prisma-token.repository';
import { BcryptAdapter } from '@common/hash/bcrypt.adapter';
import { NotificationServiceAdapter } from '@common/notification/notification-service.adapter';

// Interface Layer
import { AuthController } from '@auth/interface/grpc/auth.controller';

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    UsersModule,
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: NOTIFICATION_SERVICE_NAME,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: notificationProtobufPackage,
            protoPath: join(
              process.cwd(),
              'libs/common/src/protos/notification.proto',
            ),
            url: configService.get<string>('NOTIFICATION_SERVICE_URL'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshUseCase,
    SetPasswordUseCase,
    ValidateTokenUseCase,
    ValidateJwtUseCase,
    ForgotPasswordUseCase,
    ChangePasswordUseCase,
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
    {
      provide: EmailServicePort,
      useClass: NotificationServiceAdapter,
    },
  ],
})
export class AuthModule {}
