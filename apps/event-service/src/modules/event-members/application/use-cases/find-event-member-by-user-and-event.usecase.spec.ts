import { FindEventMemberByUserAndEventUseCase } from './get-event-member.use-case';
import { EventMemberRepository } from '../ports/event-member.repository';
import { EventRepository } from '../../../events/application/ports/event.repository';
import { GetEventMemberDTO } from '../dto/get-event-member.dto';

describe('FindEventMemberByUserAndEventUseCase', () => {
  let mockEventMemberRepo: jest.Mocked<EventMemberRepository>;
  let mockEventRepo: jest.Mocked<EventRepository>;
  let useCase: FindEventMemberByUserAndEventUseCase;

  beforeEach(() => {
    mockEventMemberRepo = {
      findByUserAndEvent: jest.fn(),
    } as unknown as jest.Mocked<EventMemberRepository>;

    mockEventRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new FindEventMemberByUserAndEventUseCase(mockEventMemberRepo, mockEventRepo);
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockEventRepo.findById.mockResolvedValue(null);
    const dto: GetEventMemberDTO = { userId: 1, eventId: 99 };

    await expect(useCase.execute(dto)).rejects.toThrow('Event not found');
  });

  it('debe retornar null si el miembro no existe', async () => {
    mockEventRepo.findById.mockResolvedValue({ id: 1, name: 'Hackathon' } as any);
    mockEventMemberRepo.findByUserAndEvent.mockResolvedValue(null);

    const dto: GetEventMemberDTO = { userId: 1, eventId: 1 };
    const result = await useCase.execute(dto);

    expect(result).toBeNull();
    expect(mockEventMemberRepo.findByUserAndEvent).toHaveBeenCalledWith(1, 1);
  });

  it('debe retornar el miembro si existe', async () => {
    const mockMember = { id: 1, userId: 1, eventId: 1 };
    mockEventRepo.findById.mockResolvedValue({ id: 1, name: 'Hackathon' } as any);
    mockEventMemberRepo.findByUserAndEvent.mockResolvedValue(mockMember as any);

    const dto: GetEventMemberDTO = { userId: 1, eventId: 1 };
    const result = await useCase.execute(dto);

    expect(result).toEqual(mockMember);
  });
});
