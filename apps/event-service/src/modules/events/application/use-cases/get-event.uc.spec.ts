import { GetEventUC } from './get-event.uc';
import { EventRepository } from '../ports/event.repository';
import { GetEventDTO } from '../dto/get-event.dto';

describe('GetEventUC', () => {
  let mockRepo: jest.Mocked<EventRepository>;
  let useCase: GetEventUC;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new GetEventUC(mockRepo);
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const dto: GetEventDTO = { id: 999 };

    await expect(useCase.execute(dto)).rejects.toThrow('Event not found');
  });

  it('debe retornar el evento existente', async () => {
    const event = { id: 1, name: 'Hackathon' };
    mockRepo.findById.mockResolvedValue(event as any);

    const dto: GetEventDTO = { id: 1 };
    const result = await useCase.execute(dto);

    expect(result).toEqual(event);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });
});
