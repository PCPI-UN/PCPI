import { ListCoursesUseCase } from './list-course.uc';
import { CourseRepository } from '../ports/course.repository';
import { ListCoursesDTO } from '../dto/list-course.dto';

describe('ListCoursesUseCase', () => {
  let mockRepo: jest.Mocked<CourseRepository>;
  let useCase: ListCoursesUseCase;

  beforeEach(() => {
    mockRepo = {
      list: jest.fn(),
    } as unknown as jest.Mocked<CourseRepository>;

    useCase = new ListCoursesUseCase(mockRepo);
  });

  it('usa valores por defecto si no se envían page y pageSize', async () => {
    mockRepo.list.mockResolvedValue({ items: [], total: 0 });

    const dto = {} as ListCoursesDTO;
    await useCase.execute(dto);

    expect(mockRepo.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 20 }),
    );
  });

  it('lista cursos con filtros válidos', async () => {
    mockRepo.list.mockResolvedValue({
      items: [{ id: 1, code: 'ENG101' } as any],
      total: 1,
    });

    const dto: ListCoursesDTO = { q: 'ENG', page: 2, pageSize: 5, onlyActive: true };
    const result = await useCase.execute(dto);

    expect(result.items.length).toBe(1);
    expect(mockRepo.list).toHaveBeenCalledWith(dto);
  });
});
