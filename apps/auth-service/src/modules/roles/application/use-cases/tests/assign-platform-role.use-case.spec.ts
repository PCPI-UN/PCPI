import { AssignPlatformRoleUseCase } from '../assign-platform-role.use-case';
import { PrismaService } from '../../../../../common/prisma/prisma.service';

describe('AssignPlatformRoleUseCase', () => {
  let useCase: AssignPlatformRoleUseCase;
  let mockPrismaService: any;

  beforeEach(() => {
    mockPrismaService = {
      platformStaff: {
        createMany: jest.fn(),
      },
    } as any;

    useCase = new AssignPlatformRoleUseCase(mockPrismaService);
  });

  describe('execute', () => {
    it('should assign roles to user using default prisma client', async () => {
      const userId = 1;
      const roleIds = [1, 2, 3];

      mockPrismaService.platformStaff.createMany.mockResolvedValue({ count: 3 });

      await useCase.execute(userId, roleIds);

      expect(mockPrismaService.platformStaff.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, roleId: 1, active: true },
          { userId: 1, roleId: 2, active: true },
          { userId: 1, roleId: 3, active: true },
        ],
        skipDuplicates: true,
      });
    });

    it('should assign roles to user using transaction client', async () => {
      const userId = 2;
      const roleIds = [5, 6];
      const mockTx = {
        platformStaff: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      } as any;

      await useCase.execute(userId, roleIds, mockTx);

      expect(mockTx.platformStaff.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 2, roleId: 5, active: true },
          { userId: 2, roleId: 6, active: true },
        ],
        skipDuplicates: true,
      });
      expect(mockPrismaService.platformStaff.createMany).not.toHaveBeenCalled();
    });

    it('should skip duplicates when assigning roles', async () => {
      const userId = 1;
      const roleIds = [1, 2];

      mockPrismaService.platformStaff.createMany.mockResolvedValue({ count: 1 }); // Only 1 inserted (1 was duplicate)

      await useCase.execute(userId, roleIds);

      expect(mockPrismaService.platformStaff.createMany).toHaveBeenCalledWith({
        data: expect.any(Array),
        skipDuplicates: true,
      });
    });

    it('should handle empty roleIds array', async () => {
      const userId = 1;
      const roleIds: number[] = [];

      mockPrismaService.platformStaff.createMany.mockResolvedValue({ count: 0 });

      await useCase.execute(userId, roleIds);

      expect(mockPrismaService.platformStaff.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });
    });
  });
});
