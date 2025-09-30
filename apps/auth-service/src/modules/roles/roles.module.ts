import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';
import { RoleRepositoryPort } from '@roles/domain/repositories/role.repository.port';
import { PrismaRoleRepository } from '@roles/infrastructure/prisma/prisma-role.repository';
import { ValidateRolesExistUseCase } from '@roles/application/use-cases/validate-roles-exist.use-case';
import { AssignPlatformRoleUseCase } from '@roles/application/use-cases/assign-platform-role.use-case';

@Module({
  imports: [PrismaModule],
  providers: [
    ValidateRolesExistUseCase,
    AssignPlatformRoleUseCase,
    {
      provide: RoleRepositoryPort,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [ValidateRolesExistUseCase, AssignPlatformRoleUseCase],
})
export class RolesModule {}
