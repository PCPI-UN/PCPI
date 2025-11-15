import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { UsersModule } from '@users/users.module';
import { PermissionsController } from './interface/grpc/permissions.controller';
import { GetUserPermissionsUseCase } from './application/use-cases/get-user-permissions.use-case';
import { IsPlatformStaffUseCase } from './application/use-cases/is-platform-staff.use-case';
import { PermissionRepositoryPort } from './domain/repositories/permission.repository.port';
import { PrismaPermissionRepository } from './infrastructure/prisma/prisma-permission.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [PermissionsController],
  providers: [
    GetUserPermissionsUseCase,
    IsPlatformStaffUseCase,
    {
      provide: PermissionRepositoryPort,
      useClass: PrismaPermissionRepository,
    },
  ],
})
export class PermissionsModule {}
