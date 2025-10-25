import { Test, TestingModule } from '@nestjs/testing';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { of } from 'rxjs';
import { AcceptInvitationUseCase } from '../accept-invitation.use-case';
import { InvitationRepositoryPort } from '../../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../../domain/repositories/invitation-role.repository.port';
import {
  Invitation,
  InvitationStatus,
  InvitationTargetType,
} from '../../../domain/entities/invitation.entity';
import { InvitationRole } from '../../../domain/entities/invitation-role.entity';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '../../../../../../../../libs/common/src/generated/auth';
import { EventServiceClient } from '../../../../../../../../libs/common/src/generated/event';
import { EVENT_SERVICE_NAME } from '../../../invitations.module';

describe('AcceptInvitationUseCase', () => {
  let useCase: AcceptInvitationUseCase;
  let invitationRepository: jest.Mocked<InvitationRepositoryPort>;
  let invitationRoleRepository: jest.Mocked<InvitationRoleRepositoryPort>;
  let authService: jest.Mocked<AuthServiceClient>;
  let eventService: jest.Mocked<EventServiceClient>;

  beforeEach(async () => {
    const mockInvitationRepository = {
      findByToken: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTarget: jest.fn(),
      delete: jest.fn(),
    };

    const mockInvitationRoleRepository = {
      findByInvitationId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockAuthService = {
      getUser: jest.fn(),
      getUserByEmail: jest.fn(),
      createBasicUser: jest.fn(),
      activateUser: jest.fn(),
      updateUser: jest.fn(),
      assignPlatformRoles: jest.fn(),
      getRolesByIds: jest.fn(),
    };

    const mockEventService = {
      getEvent: jest.fn(),
      createEventMember: jest.fn(),
    };

    const mockAuthClientGrpc = {
      getService: jest.fn().mockReturnValue(mockAuthService),
    };

    const mockEventClientGrpc = {
      getService: jest.fn().mockReturnValue(mockEventService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcceptInvitationUseCase,
        {
          provide: InvitationRepositoryPort,
          useValue: mockInvitationRepository,
        },
        {
          provide: InvitationRoleRepositoryPort,
          useValue: mockInvitationRoleRepository,
        },
        {
          provide: AUTH_SERVICE_NAME,
          useValue: mockAuthClientGrpc,
        },
        {
          provide: EVENT_SERVICE_NAME,
          useValue: mockEventClientGrpc,
        },
      ],
    }).compile();

    useCase = module.get<AcceptInvitationUseCase>(AcceptInvitationUseCase);
    invitationRepository = module.get(InvitationRepositoryPort);
    invitationRoleRepository = module.get(InvitationRoleRepositoryPort);

    // Trigger onModuleInit
    await useCase.onModuleInit();

    authService = mockAuthService as Partial<AuthServiceClient> as jest.Mocked<AuthServiceClient>;
    eventService = mockEventService as Partial<EventServiceClient> as jest.Mocked<EventServiceClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Platform Invitation', () => {
    it('should accept platform invitation with password (new user activation)', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      const roles = [
        new InvitationRole('inv-123', 10),
        new InvitationRole('inv-123', 11),
      ];

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue(roles);
      authService.activateUser.mockReturnValue(of({}) as any);
      authService.assignPlatformRoles.mockReturnValue(of({}) as any);
      invitationRepository.save.mockResolvedValue(invitation);

      // Act
      const result = await useCase.execute({
        token: 'token-abc',
        password: 'securePassword123',
      });

      // Assert
      expect(result).toEqual({ success: true });
      expect(invitationRepository.findByToken).toHaveBeenCalledWith('token-abc');
      expect(authService.activateUser).toHaveBeenCalledWith({
        userId: 200,
        password: 'securePassword123',
      });
      expect(authService.assignPlatformRoles).toHaveBeenCalledWith({
        userId: 200,
        roleIds: [10, 11],
      });
      expect(invitation.status).toBe(InvitationStatus.ACCEPTED);
      expect(invitationRepository.save).toHaveBeenCalledWith(invitation);
    });

    it('should accept platform invitation without password (existing user)', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      const roles = [new InvitationRole('inv-123', 10)];

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue(roles);
      authService.assignPlatformRoles.mockReturnValue(of({}) as any);
      invitationRepository.save.mockResolvedValue(invitation);

      // Act
      const result = await useCase.execute({ token: 'token-abc' });

      // Assert
      expect(result).toEqual({ success: true });
      expect(authService.activateUser).not.toHaveBeenCalled();
      expect(authService.assignPlatformRoles).toHaveBeenCalledWith({
        userId: 200,
        roleIds: [10],
      });
    });

    it('should accept platform invitation and update user profile', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue([]);
      authService.updateUser.mockReturnValue(of({}) as any);
      invitationRepository.save.mockResolvedValue(invitation);

      // Act
      const result = await useCase.execute({
        token: 'token-abc',
        firstName: 'John',
        lastName: 'Doe',
      });

      // Assert
      expect(result).toEqual({ success: true });
      expect(authService.updateUser).toHaveBeenCalledWith({
        id: 200,
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('Happy Path - Event Invitation', () => {
    it('should accept event invitation with roles', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.EVENT,
        5,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      const roles = [
        new InvitationRole('inv-123', 20),
        new InvitationRole('inv-123', 21),
      ];

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue(roles);
      eventService.createEventMember.mockReturnValue(of({}) as any);
      invitationRepository.save.mockResolvedValue(invitation);

      // Act
      const result = await useCase.execute({ token: 'token-abc' });

      // Assert
      expect(result).toEqual({ success: true });
      expect(eventService.createEventMember).toHaveBeenCalledTimes(2);
      expect(eventService.createEventMember).toHaveBeenCalledWith({
        eventId: 5,
        userId: 200,
        roleId: 20,
      });
      expect(eventService.createEventMember).toHaveBeenCalledWith({
        eventId: 5,
        userId: 200,
        roleId: 21,
      });
      expect(invitation.status).toBe(InvitationStatus.ACCEPTED);
    });

    it('should accept event invitation without roles', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.EVENT,
        5,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue([]);
      invitationRepository.save.mockResolvedValue(invitation);

      // Act
      const result = await useCase.execute({ token: 'token-abc' });

      // Assert
      expect(result).toEqual({ success: true });
      expect(eventService.createEventMember).not.toHaveBeenCalled();
    });
  });

  describe('Error Cases', () => {
    it('should throw FAILED_PRECONDITION when invitation not found', async () => {
      // Arrange
      invitationRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute({ token: 'invalid-token' }),
      ).rejects.toThrow(
        new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Invitation cannot be accepted',
        }),
      );

      expect(invitationRepository.save).not.toHaveBeenCalled();
    });

    it('should throw FAILED_PRECONDITION when invitation is expired', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.PENDING,
        pastDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);

      // Act & Assert
      await expect(useCase.execute({ token: 'token-abc' })).rejects.toThrow(
        new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Invitation cannot be accepted',
        }),
      );
    });

    it('should throw FAILED_PRECONDITION when invitation is already accepted', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.ACCEPTED,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);

      // Act & Assert
      await expect(useCase.execute({ token: 'token-abc' })).rejects.toThrow(
        new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Invitation cannot be accepted',
        }),
      );
    });

    it('should throw FAILED_PRECONDITION when invitation is rejected', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PLATFORM,
        1,
        InvitationStatus.REJECTED,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);

      // Act & Assert
      await expect(useCase.execute({ token: 'token-abc' })).rejects.toThrow(
        new RpcException({
          code: status.FAILED_PRECONDITION,
          message: 'Invitation cannot be accepted',
        }),
      );
    });

    it('should throw UNIMPLEMENTED for project invitations', async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const invitation = new Invitation(
        'inv-123',
        'token-abc',
        'user@example.com',
        InvitationTargetType.PROJECT,
        10,
        InvitationStatus.PENDING,
        futureDate,
        100,
        200,
        new Date(),
        new Date(),
      );

      invitationRepository.findByToken.mockResolvedValue(invitation);
      invitationRoleRepository.findByInvitationId.mockResolvedValue([]);

      // Act & Assert
      await expect(useCase.execute({ token: 'token-abc' })).rejects.toThrow(
        new RpcException({
          code: status.UNIMPLEMENTED,
          message: 'Project invitation acceptance is not yet implemented',
        }),
      );

      expect(invitationRepository.save).not.toHaveBeenCalled();
    });
  });
});
