import { Role } from '@roles/domain/entities/role.entity';

export abstract class RoleRepositoryPort {
  abstract countByIds(roleIds: number[]): Promise<number>;
}
