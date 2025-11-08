import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PermissionsController } from './interface/grpc/permissions.controller';
import { GetUserPermissionsUseCase } from './application/use-cases/get-user-permissions.use-case';
import { PermissionRepositoryPort } from './domain/repositories/permission.repository.port';
import { PrismaPermissionRepository } from './infrastructure/prisma/prisma-permission.repository';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [
    GetUserPermissionsUseCase,
    {
      provide: PermissionRepositoryPort,
      useClass: PrismaPermissionRepository,
    },
  ],
})
export class PermissionsModule {}
