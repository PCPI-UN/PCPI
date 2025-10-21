import { Test, TestingModule } from '@nestjs/testing';
import { status } from '@grpc/grpc-js';
import { of, throwError } from 'rxjs';
import { CreateInvitationUseCase } from '../create-invitation.use-case';
import { InvitationRepositoryPort } from '../../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../../domain/repositories/invitation-role.repository.port';
import {
  Invitation,
  InvitationStatus,
  InvitationTargetType,
} from '../../../domain/entities/invitation.entity';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '../../../../../../../../libs/common/src/generated/auth';
import {
  NOTIFICATION_SERVICE_NAME,
  NotificationServiceClient,
} from '../../../../../../../../libs/common/src/generated/notification';
import { EventServiceClient } from '../../../../../../../../libs/common/src/generated/event';
import { ProjectsServiceClient } from '../../../../../../../../libs/common/src/generated/project';
import {
  EVENT_SERVICE_NAME,
  PROJECT_SERVICE_NAME,
} from '../../../invitations.module';

describe('CreateInvitationUseCase', () => {
  let useCase: CreateInvitationUseCase;
  let invitationRepository: jest.Mocked<InvitationRepositoryPort>;
  let invitationRoleRepository: jest.Mocked<InvitationRoleRepositoryPort>;
  let authService: jest.Mocked<AuthServiceClient>;
  let notificationService: jest.Mocked<NotificationServiceClient>;
  let eventService: jest.Mocked<EventServiceClient>;
  let projectService: jest.Mocked<ProjectsServiceClient>;

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

    const mockNotificationService = {
      sendEmail: jest.fn(),
    };

    const mockEventService = {
      getEvent: jest.fn(),
      createEventMember: jest.fn(),
    };

    const mockProjectService = {
      getProject: jest.fn(),
    };

    const mockAuthClientGrpc = {
      getService: jest.fn().mockReturnValue(mockAuthService),
    };

    const mockNotificationClientGrpc = {
      getService: jest.fn().mockReturnValue(mockNotificationService),
    };

    const mockEventClientGrpc = {
      getService: jest.fn().mockReturnValue(mockEventService),
    };

    const mockProjectClientGrpc = {
      getService: jest.fn().mockReturnValue(mockProjectService),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInvitationUseCase,
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
          provide: NOTIFICATION_SERVICE_NAME,
          useValue: mockNotificationClientGrpc,
        },
        {
          provide: EVENT_SERVICE_NAME,
          useValue: mockEventClientGrpc,
        },
        {
          provide: PROJECT_SERVICE_NAME,
          useValue: mockProjectClientGrpc,
        },
      ],
    }).compile();

    useCase = module.get<CreateInvitationUseCase>(CreateInvitationUseCase);
    invitationRepository = module.get(InvitationRepositoryPort);
    invitationRoleRepository = module.get(InvitationRoleRepositoryPort);

    // Trigger onModuleInit
    await useCase.onModuleInit();

    authService = mockAuthService as Partial<AuthServiceClient> as jest.Mocked<AuthServiceClient>;
    notificationService =
      mockNotificationService as Partial<NotificationServiceClient> as jest.Mocked<NotificationServiceClient>;
    eventService = mockEventService as Partial<EventServiceClient> as jest.Mocked<EventServiceClient>;
    projectService = mockProjectService as Partial<ProjectsServiceClient> as jest.Mocked<ProjectsServiceClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Existing User', () => {
    it('should create invitation for existing user', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        status: 'CONFIRMED',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      invitationRoleRepository.save.mockImplementation((role) =>
        Promise.resolve(role),
      );
      authService.getRolesByIds.mockReturnValue(
        of({ roles: [{ id: 10, name: 'Admin' }] }) as any,
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      const result = await useCase.execute({
        email: 'existing@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [10],
      });

      // Assert
      expect(result).toBeInstanceOf(Invitation);
      expect(result.email).toBe('existing@example.com');
      expect(result.status).toBe(InvitationStatus.PENDING);
      expect(result.invitedUserId).toBe(200);
      expect(authService.getUserByEmail).toHaveBeenCalledWith({
        email: 'existing@example.com',
      });
      expect(authService.createBasicUser).not.toHaveBeenCalled();
      expect(invitationRepository.save).toHaveBeenCalled();
      expect(invitationRoleRepository.save).toHaveBeenCalled();
      expect(notificationService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('Happy Path - New User', () => {
    it('should create invitation and basic user for new email', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockNewUser = {
        id: 201,
        email: 'newuser@example.com',
        firstName: 'newuser',
        lastName: undefined,
        status: 'PENDING',
      };

      authService.getUserByEmail.mockReturnValue(
        throwError(() => ({ code: status.NOT_FOUND })) as any,
      );
      authService.createBasicUser.mockReturnValue(of(mockNewUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      authService.getRolesByIds.mockReturnValue(
        of({ roles: [{ id: 10, name: 'User' }] }) as any,
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      const result = await useCase.execute({
        email: 'newuser@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [10],
      });

      // Assert
      expect(result.invitedUserId).toBe(201);
      expect(authService.getUserByEmail).toHaveBeenCalledWith({
        email: 'newuser@example.com',
      });
      expect(authService.createBasicUser).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        firstName: 'newuser',
        lastName: undefined,
      });
    });

    it('should create user with provided firstName and lastName', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockNewUser = {
        id: 202,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        status: 'PENDING',
      };

      authService.getUserByEmail.mockReturnValue(
        throwError(() => ({ code: status.NOT_FOUND })) as any,
      );
      authService.createBasicUser.mockReturnValue(of(mockNewUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      authService.getRolesByIds.mockReturnValue(of({ roles: [] }) as any);
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'john@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [],
        firstName: 'John',
        lastName: 'Smith',
      });

      // Assert
      expect(authService.createBasicUser).toHaveBeenCalledWith({
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
      });
    });
  });

  describe('Happy Path - Platform Invitation', () => {
    it('should create platform invitation with roles', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'user@example.com',
        firstName: 'Test',
        status: 'CONFIRMED',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      invitationRoleRepository.save.mockImplementation((role) =>
        Promise.resolve(role),
      );
      authService.getRolesByIds.mockReturnValue(
        of({
          roles: [
            { id: 10, name: 'Admin' },
            { id: 11, name: 'Editor' },
          ],
        }) as any,
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'user@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [10, 11],
      });

      // Assert
      expect(authService.getRolesByIds).toHaveBeenCalledWith({
        roleIds: [10, 11],
      });
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Welcome to the Platform - Invitation',
          body: expect.stringContaining('Admin, Editor'),
        }),
      );
    });

    it('should create platform invitation without roles', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'user@example.com',
        firstName: 'Test',
        status: 'CONFIRMED',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'user@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [],
      });

      // Assert
      expect(authService.getRolesByIds).not.toHaveBeenCalled();
      expect(invitationRoleRepository.save).not.toHaveBeenCalled();
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to the Platform - Invitation',
          body: expect.stringContaining(
            'You have been invited to join the platform',
          ),
        }),
      );
    });
  });

  describe('Happy Path - Event Invitation', () => {
    it('should create event invitation with event details', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'user@example.com',
        firstName: 'Test',
        status: 'CONFIRMED',
      };

      const mockEvent = {
        id: 5,
        name: 'Tech Conference 2024',
        description: 'Annual tech conference',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      eventService.getEvent.mockReturnValue(of(mockEvent) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      invitationRoleRepository.save.mockImplementation((role) =>
        Promise.resolve(role),
      );
      authService.getRolesByIds.mockReturnValue(
        of({ roles: [{ id: 20, name: 'Speaker' }] }) as any,
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'user@example.com',
        targetType: InvitationTargetType.EVENT,
        targetId: 5,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [20],
      });

      // Assert
      expect(eventService.getEvent).toHaveBeenCalledWith({ id: 5 });
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Invitation to Event: Tech Conference 2024',
          body: expect.stringContaining('Tech Conference 2024'),
        }),
      );
    });
  });

  describe('Happy Path - Project Invitation', () => {
    it('should create project invitation with project and event details', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'user@example.com',
        firstName: 'Test',
        status: 'CONFIRMED',
      };

      const mockProject = {
        project: {
          id: 10,
          name: 'AI Research Project',
          eventId: 5,
        },
      };

      const mockEvent = {
        id: 5,
        name: 'Research Symposium',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      projectService.getProject.mockReturnValue(of(mockProject) as any);
      eventService.getEvent.mockReturnValue(of(mockEvent) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'user@example.com',
        targetType: InvitationTargetType.PROJECT,
        targetId: 10,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [],
      });

      // Assert
      expect(projectService.getProject).toHaveBeenCalledWith({ id: 10 });
      expect(eventService.getEvent).toHaveBeenCalledWith({ id: 5 });
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Congratulations! Your Project Has Been Approved',
          body: expect.stringContaining('AI Research Project'),
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty roleIds array', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockUser = {
        id: 200,
        email: 'user@example.com',
        firstName: 'Test',
        status: 'CONFIRMED',
      };

      authService.getUserByEmail.mockReturnValue(of(mockUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      authService.getRolesByIds.mockReturnValue(of({ roles: [] }) as any);
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'user@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [],
      });

      // Assert
      expect(invitationRoleRepository.save).not.toHaveBeenCalled();
      expect(authService.getRolesByIds).not.toHaveBeenCalled();
    });

    it('should use email username as firstName when not provided for new users', async () => {
      // Arrange
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const mockNewUser = {
        id: 201,
        email: 'john.doe@example.com',
        firstName: 'john.doe',
        status: 'PENDING',
      };

      authService.getUserByEmail.mockReturnValue(
        throwError(() => ({ code: status.NOT_FOUND })) as any,
      );
      authService.createBasicUser.mockReturnValue(of(mockNewUser) as any);
      invitationRepository.save.mockImplementation((inv) =>
        Promise.resolve(inv),
      );
      authService.getRolesByIds.mockReturnValue(of({ roles: [] }) as any);
      notificationService.sendEmail.mockReturnValue(of({}) as any);

      // Act
      await useCase.execute({
        email: 'john.doe@example.com',
        targetType: InvitationTargetType.PLATFORM,
        targetId: 1,
        expiresAt,
        invitedByUserId: 100,
        roleIds: [],
      });

      // Assert
      expect(authService.createBasicUser).toHaveBeenCalledWith({
        email: 'john.doe@example.com',
        firstName: 'john.doe',
        lastName: undefined,
      });
    });
  });
});
