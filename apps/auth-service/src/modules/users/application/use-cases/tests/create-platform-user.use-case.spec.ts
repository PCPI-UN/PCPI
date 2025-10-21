import { CreatePlatformUserUseCase } from '../create-platform-user.use-case';
import { UserRepositoryPort } from '../../../../users/domain/repositories/user.repository.port';
import { PasswordHasherPort } from '../../../../../common/ports/password-hasher.port';
import { ValidateRolesExistUseCase } from '../../../../roles/application/use-cases/validate-roles-exist.use-case';
import { AssignPlatformRoleUseCase } from '../../../../roles/application/use-cases/assign-platform-role.use-case';
import { PrismaService } from '../../../../../common/prisma/prisma.service';
import { CreatePlatformUserDto } from '../../../../users/application/dto/create-platform-user.dto';
import { User, UserStatus } from '../../../../users/domain/entities/user.entity';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

describe('CreatePlatformUserUseCase', () => {
  let useCase: CreatePlatformUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepositoryPort>;
  let mockPasswordHasher: jest.Mocked<PasswordHasherPort>;
  let mockValidateRolesExistUseCase: jest.Mocked<ValidateRolesExistUseCase>;
  let mockAssignPlatformRoleUseCase: jest.Mocked<AssignPlatformRoleUseCase>;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      existsByPhone: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      deactivate: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<PasswordHasherPort>;

    mockValidateRolesExistUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ValidateRolesExistUseCase>;

    mockAssignPlatformRoleUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<AssignPlatformRoleUseCase>;

    mockPrismaService = {
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    } as unknown as jest.Mocked<PrismaService>;

    useCase = new CreatePlatformUserUseCase(
      mockUserRepository,
      mockPasswordHasher,
      mockValidateRolesExistUseCase,
      mockAssignPlatformRoleUseCase,
      mockPrismaService,
    );
  });

  describe('execute', () => {
    it('should create platform user with roles and return user entity', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        roleIds: [1, 2],
      };

      const createdUser = new User(
        1,
        'John',
        'Doe',
        'john@example.com',
        'hashed-password',
        '1234567890',
        true,
        UserStatus.PENDING,
      );

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByPhone.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAssignPlatformRoleUseCase.execute.mockResolvedValue(undefined);

      const result = await useCase.execute(createDto);

      expect(result).toEqual(createdUser);
      expect(mockValidateRolesExistUseCase.execute).toHaveBeenCalledWith([1, 2]);
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepository.existsByPhone).toHaveBeenCalledWith('1234567890');
      expect(mockPasswordHasher.hash).toHaveBeenCalled();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'john@example.com',
          firstName: 'John',
        }),
        mockPrismaService,
      );
      expect(mockAssignPlatformRoleUseCase.execute).toHaveBeenCalledWith(
        1,
        [1, 2],
        mockPrismaService,
      );
    });

    it('should throw error when roleIds are invalid', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        roleIds: [999], // Invalid role ID
      };

      mockValidateRolesExistUseCase.execute.mockRejectedValue(
        new RpcException({
          code: status.NOT_FOUND,
          message: 'Some roles do not exist',
        }),
      );

      await expect(useCase.execute(createDto)).rejects.toThrow(RpcException);

      expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ALREADY_EXISTS when email already exists', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        phone: '1234567890',
        roleIds: [1],
      };

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      await expect(useCase.execute(createDto)).rejects.toThrow(RpcException);
      await expect(useCase.execute(createDto)).rejects.toThrow(
        expect.objectContaining({
          error: expect.objectContaining({
            code: status.ALREADY_EXISTS,
            message: 'Another user with this email already exists',
          }),
        }),
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ALREADY_EXISTS when phone already exists', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        roleIds: [1],
      };

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByPhone.mockResolvedValue(true);

      await expect(useCase.execute(createDto)).rejects.toThrow(RpcException);
      await expect(useCase.execute(createDto)).rejects.toThrow(
        expect.objectContaining({
          error: expect.objectContaining({
            code: status.ALREADY_EXISTS,
            message: 'Another user with this phone number already exists',
          }),
        }),
      );

      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should generate random password and hash it', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        roleIds: [1],
      };

      const createdUser = new User(
        1,
        'John',
        'Doe',
        'john@example.com',
        'hashed-random-password',
        '1234567890',
        true,
        UserStatus.PENDING,
      );

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByPhone.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashed-random-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAssignPlatformRoleUseCase.execute.mockResolvedValue(undefined);

      await useCase.execute(createDto);

      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(expect.any(String));
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith(
        expect.stringMatching(/^[a-f0-9]{32}$/), // 16 bytes as hex = 32 chars
      );
    });

    it('should execute in transaction with save user and assign roles', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890',
        roleIds: [1, 2],
      };

      const createdUser = new User(
        1,
        'John',
        'Doe',
        'john@example.com',
        'hashed-password',
        '1234567890',
        true,
        UserStatus.PENDING,
      );

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockUserRepository.existsByPhone.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAssignPlatformRoleUseCase.execute.mockResolvedValue(undefined);

      await useCase.execute(createDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.any(User),
        mockPrismaService,
      );
      expect(mockAssignPlatformRoleUseCase.execute).toHaveBeenCalledWith(
        1,
        [1, 2],
        mockPrismaService,
      );
    });

    it('should allow null/undefined phone number', async () => {
      const createDto: CreatePlatformUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: undefined,
        roleIds: [1],
      };

      const createdUser = new User(
        1,
        'John',
        'Doe',
        'john@example.com',
        'hashed-password',
        '',
        true,
        UserStatus.PENDING,
      );

      mockValidateRolesExistUseCase.execute.mockResolvedValue(undefined);
      mockUserRepository.existsByEmail.mockResolvedValue(false);
      mockPasswordHasher.hash.mockResolvedValue('hashed-password');
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAssignPlatformRoleUseCase.execute.mockResolvedValue(undefined);

      const result = await useCase.execute(createDto);

      expect(result).toEqual(createdUser);
      expect(mockUserRepository.existsByPhone).not.toHaveBeenCalled();
    });
  });
});
