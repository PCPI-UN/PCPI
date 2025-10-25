import { DeactivateUserUseCase } from '../deactivate-user.use-case';
import { UserRepositoryPort } from '../../../../users/domain/repositories/user.repository.port';
import { DeactivateUserDto } from '../../../../users/application/dto/deactivate-user.dto';
import { User, UserStatus } from '../../../../users/domain/entities/user.entity';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      deactivate: jest.fn(),
      save: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      existsByPhone: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    useCase = new DeactivateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should deactivate user successfully when user exists', async () => {
      const deactivateDto: DeactivateUserDto = { id: 1 };
      const mockUser = new User(
        1,
        'John',
        'Doe',
        'john@example.com',
        'hashed-password',
        '1234567890',
        true,
        UserStatus.CONFIRMED,
      );

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.deactivate.mockResolvedValue(undefined);

      const result = await useCase.execute(deactivateDto);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.deactivate).toHaveBeenCalledWith(1);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      const deactivateDto: DeactivateUserDto = { id: 999 };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(deactivateDto)).rejects.toThrow(RpcException);
      await expect(useCase.execute(deactivateDto)).rejects.toThrow(
        expect.objectContaining({
          error: expect.objectContaining({
            code: status.NOT_FOUND,
            message: 'User with ID #999 not found',
          }),
        }),
      );

      expect(mockUserRepository.deactivate).not.toHaveBeenCalled();
    });

    it('should deactivate already inactive user without error', async () => {
      const deactivateDto: DeactivateUserDto = { id: 2 };
      const inactiveUser = new User(
        2,
        'Jane',
        'Smith',
        'jane@example.com',
        'hashed-password',
        '9876543210',
        false, // Already inactive
        UserStatus.CONFIRMED,
      );

      mockUserRepository.findById.mockResolvedValue(inactiveUser);
      mockUserRepository.deactivate.mockResolvedValue(undefined);

      const result = await useCase.execute(deactivateDto);

      expect(result).toEqual({ success: true });
      expect(mockUserRepository.deactivate).toHaveBeenCalledWith(2);
    });
  });
});
