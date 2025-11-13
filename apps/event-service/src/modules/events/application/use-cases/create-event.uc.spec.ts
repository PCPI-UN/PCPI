import { CreateEventUC } from './create-event.uc';
import { EventRepository } from '../../domain/repositories/event.repository';
import { CreateEventDTO } from '../dto/create-event.dto';

describe('CreateEventUC', () => {
  let mockRepo: jest.Mocked<EventRepository>;
  let useCase: CreateEventUC;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<EventRepository>;

    useCase = new CreateEventUC(mockRepo);
  });

  it('debe lanzar error si el nombre está vacío', async () => {
    const dto = {
      name: '  ',
      description: 'Evento sin nombre',
      accessCode: 'ABC123',
      isPubliclyJoinable: true,
      inscriptionDeadline: '2025-10-20',
      evaluationsOpened: false,
      startDate: '2025-10-25',
      endDate: '2025-10-26',
    } as CreateEventDTO;

    await expect(useCase.execute(dto)).rejects.toThrow('Name is required');
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('debe crear el evento correctamente con datos válidos', async () => {
    const dto: CreateEventDTO = {
      organizationId: 1,
      name: 'Hackathon 2025',
      description: 'Evento de programación',
      accessCode: 'XYZ999',
      isPubliclyJoinable: true,
      inscriptionDeadline: '2025-10-20',
      evaluationsOpened: false,
      startDate: '2025-10-25',
      endDate: '2025-10-26',
    };

    const expectedEvent = { id: 1, name: dto.name, active: true };
    mockRepo.create.mockResolvedValue(expectedEvent as any);

    const result = await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledTimes(1);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Hackathon 2025',
      active: true,
    }));
    expect(result).toEqual(expectedEvent);
  });
});
