import { CreateEventMemberUseCase } from './create-event-member.use-case';
import { EventMemberRepository } from '../../domain/repositories/event-member.repository';
import { EventRepository } from '../../../events/domain/repositories/event.repository';
import { CreateEventMember } from '../dto/create-event-member.dto';

describe('CreateEventMemberUseCase', () => {
  let mockEventMemberRepo: jest.Mocked<EventMemberRepository>;
  let mockEventRepo: jest.Mocked<EventRepository>;
  let useCase: CreateEventMemberUseCase;

  beforeEach(() => {
    mockEventMemberRepo = {
      create: jest.fn(),
      findByUserAndEvent: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<EventMemberRepository>;

    mockEventRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new CreateEventMemberUseCase(mockEventMemberRepo, mockEventRepo);
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockEventRepo.findById.mockResolvedValue(null);

    const dto: CreateEventMember = {
      userId: 1,
      eventId: 99,
      roleId: 2,
    } as any;

    await expect(useCase.execute(dto)).rejects.toThrow('Event not found');
    expect(mockEventMemberRepo.create).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el usuario ya es miembro', async () => {
    mockEventRepo.findById.mockResolvedValue({ id: 1, name: 'Hackathon' } as any);
    mockEventMemberRepo.findByUserAndEvent.mockResolvedValue({ id: 1 } as any);

    const dto: CreateEventMember = {
      userId: 1,
      eventId: 1,
      roleId: 2,
    }as any;

    await expect(useCase.execute(dto)).rejects.toThrow('User already a member');
    expect(mockEventMemberRepo.create).not.toHaveBeenCalled();
  });

  it('debe crear un nuevo miembro si no existe previamente', async () => {
    mockEventRepo.findById.mockResolvedValue({ id: 1, name: 'Hackathon' } as any);
    mockEventMemberRepo.findByUserAndEvent.mockResolvedValue(null);

    const expectedMember = {
      id: 1,
      userId: 1,
      eventId: 1,
      roleId: 2,
      active: true,
    };

    mockEventMemberRepo.create.mockResolvedValue(expectedMember as any);

    const dto: CreateEventMember = {
      userId: 1,
      eventId: 1,
      roleId: 2,
    }as any;

    const result = await useCase.execute(dto);

    expect(mockEventMemberRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        eventId: 1,
        roleId: 2,
        active: true,
      }),
    );
    expect(result).toEqual(expectedMember);
  });
});
