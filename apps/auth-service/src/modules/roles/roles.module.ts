import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';
import { PrismaRoleRepository } from '@roles/infrastructure/prisma/prisma-role.repository';
import { ValidateRolesExistUseCase } from '@roles/application/use-cases/validate-roles-exist.use-case';
import { AssignPlatformRoleUseCase } from '@roles/application/use-cases/assign-platform-role.use-case';
import { AssignPlatformRolesPublicUseCase } from '@roles/application/use-cases/assign-platform-roles-public.use-case';
import { GetRolesByIdsUseCase } from '@roles/application/use-cases/get-roles-by-ids.use-case';
import { RolesController } from '@roles/interface/grpc/roles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [
    ValidateRolesExistUseCase,
    AssignPlatformRoleUseCase,
    AssignPlatformRolesPublicUseCase,
    GetRolesByIdsUseCase,
    {
      provide: RoleRepositoryPort,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [ValidateRolesExistUseCase, AssignPlatformRoleUseCase],
})
export class RolesModule {}
