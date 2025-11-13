import { ListEventsUC } from './list-events.uc';
import { EventRepository } from '../../domain/repositories/event.repository';
import { ListEventsDTO } from '../dto/list-events.dto';

describe('ListEventsUC', () => {
  let mockRepo: jest.Mocked<EventRepository>;
  let useCase: ListEventsUC;

  beforeEach(() => {
    mockRepo = {
      list: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new ListEventsUC(mockRepo);
  });

  it('debe usar valores por defecto si no se pasan page ni pageSize', async () => {
    mockRepo.list.mockResolvedValue({ items: [], total: 0 });

    const dto = {} as ListEventsDTO;
    await useCase.execute(dto);

    expect(mockRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20 })
    );
  });

  it('debe listar eventos con filtros válidos', async () => {
    mockRepo.list.mockResolvedValue({
      items: [{ id: 1, name: 'Evento' } as any],
      total: 1,
    });

    const dto: ListEventsDTO = { q: 'test', page: 2, pageSize: 5, onlyActive: true };
    const result = await useCase.execute(dto);

    expect(result.items.length).toBe(1);
    expect(mockRepo.list).toHaveBeenCalledWith(dto);
  });
});
