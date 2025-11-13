import { DeleteCourseUseCase } from './delete-course.uc';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { DeleteCourseDTO } from '../dto/delete-course.dto';

describe('DeleteCourseUseCase', () => {
  let mockRepo: jest.Mocked<CourseRepository>;
  let useCase: DeleteCourseUseCase;

  beforeEach(() => {
    mockRepo = {
      delete: jest.fn(),
    } as unknown as jest.Mocked<CourseRepository>;

    useCase = new DeleteCourseUseCase(mockRepo);
  });

  it('debe eliminar el curso y retornar { ok: true }', async () => {
    const dto: DeleteCourseDTO = { id: 5 };
    const result = await useCase.execute(dto);

    expect(mockRepo.delete).toHaveBeenCalledWith(5);
    expect(result).toEqual({ ok: true });
  });
});
