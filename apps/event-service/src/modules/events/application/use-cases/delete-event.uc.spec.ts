import { DeleteEventUC } from './delete-event.uc';
import { EventRepository } from '../../domain/repositories/event.repository';
import { DeleteEventDTO } from '../dto/delete-event.dto';

describe('DeleteEventUC', () => {
  let mockRepo: jest.Mocked<EventRepository>;
  let useCase: DeleteEventUC;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new DeleteEventUC(mockRepo);
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const dto: DeleteEventDTO = { id: 999 };

    await expect(useCase.execute(dto)).rejects.toThrow('Event not found');
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('debe eliminar el evento existente', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, name: 'Evento test' } as any);

    const dto: DeleteEventDTO = { id: 1 };

    await useCase.execute(dto);

    expect(mockRepo.findById).toHaveBeenCalledWith(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
