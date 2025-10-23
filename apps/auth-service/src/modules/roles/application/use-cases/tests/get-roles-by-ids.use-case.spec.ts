import { GetRolesByIdsUseCase } from '../get-roles-by-ids.use-case';
import { RoleRepositoryPort } from '../../../../roles/domain/repositories/role.repository.port';
import { Role } from '../../../../roles/domain/entities/role.entity';

describe('GetRolesByIdsUseCase', () => {
  let useCase: GetRolesByIdsUseCase;
  let mockRoleRepository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    mockRoleRepository = {
      findByIds: jest.fn(),
      countByIds: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<RoleRepositoryPort>;

    useCase = new GetRolesByIdsUseCase(mockRoleRepository);
  });

  describe('execute', () => {
    it('should return roles when roleIds are provided', async () => {
      const roleIds = [1, 2, 3];
      const mockRoles = [
        new Role(1, 'Admin', 'Administrator role', 'PLATFORM'),
        new Role(2, 'Manager', 'Manager role', 'PLATFORM'),
        new Role(3, 'User', 'User role', 'PLATFORM'),
      ];

      mockRoleRepository.findByIds.mockResolvedValue(mockRoles);

      const result = await useCase.execute(roleIds);

      expect(result).toEqual(mockRoles);
      expect(mockRoleRepository.findByIds).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should return empty array when roleIds is empty', async () => {
      const roleIds: number[] = [];

      const result = await useCase.execute(roleIds);

      expect(result).toEqual([]);
      expect(mockRoleRepository.findByIds).not.toHaveBeenCalled();
    });

    it('should return empty array when roleIds is null or undefined', async () => {
      const result1 = await useCase.execute(null as any);
      const result2 = await useCase.execute(undefined as any);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(mockRoleRepository.findByIds).not.toHaveBeenCalled();
    });
  });
});
