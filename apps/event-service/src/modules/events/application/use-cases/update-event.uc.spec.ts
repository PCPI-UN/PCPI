import { UpdateEventUC } from './update-event.uc';
import { EventRepository } from '../ports/event.repository';
import { UpdateEventDTO } from '../dto/update-event.dto';

describe('UpdateEventUC', () => {
  let mockRepo: jest.Mocked<EventRepository>;
  let useCase: UpdateEventUC;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new UpdateEventUC(mockRepo);
  });

  it('debe lanzar error si no se envía ID', async () => {
    const dto = {} as UpdateEventDTO;

    await expect(useCase.execute(dto)).rejects.toThrow('ID requerido para actualizar evento');
  });

  it('debe lanzar error si el evento no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const dto: UpdateEventDTO = { id: 5, name: 'Nuevo' };

    await expect(useCase.execute(dto)).rejects.toThrow('Evento con id 5 no existe');
  });

  it('debe actualizar el evento existente', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, name: 'Viejo' } as any);
    mockRepo.update.mockResolvedValue({ id: 1, name: 'Nuevo' } as any);

    const dto: UpdateEventDTO = { id: 1, name: 'Nuevo' };
    const result = await useCase.execute(dto);

    expect(mockRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Nuevo' }));
    expect(result).toEqual({ id: 1, name: 'Nuevo' });
  });
});
