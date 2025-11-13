import { DeleteEventMemberUseCase } from './delete-event-member.use-case';
import { EventMemberRepository } from '../../domain/repositories/event-member.repository';
import { EventRepository } from '../../../events/domain/repositories/event.repository';
import { DeleteEventMemberDTO } from '../dto/delete-event-member.dto';

describe('DeleteEventMemberUseCase', () => {
  let mockEventMemberRepo: jest.Mocked<EventMemberRepository>;
  let mockEventRepo: jest.Mocked<EventRepository>;
  let useCase: DeleteEventMemberUseCase;

  beforeEach(() => {
    mockEventMemberRepo = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<EventMemberRepository>;

    mockEventRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new DeleteEventMemberUseCase(mockEventMemberRepo, mockEventRepo);
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockEventRepo.findById.mockResolvedValue(null);

    const dto: DeleteEventMemberDTO = { userId: 1, eventId: 99 };

    await expect(useCase.execute(dto)).rejects.toThrow('Event not found');
    expect(mockEventMemberRepo.delete).not.toHaveBeenCalled();
  });

  it('debe eliminar correctamente el miembro si el evento existe', async () => {
    mockEventRepo.findById.mockResolvedValue({ id: 1, name: 'Hackathon' } as any);

    const dto: DeleteEventMemberDTO = { userId: 1, eventId: 1 };
    await useCase.execute(dto);

    expect(mockEventMemberRepo.delete).toHaveBeenCalledWith(1, 1);
  });
});
