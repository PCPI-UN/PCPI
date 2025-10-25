import { GetCourseUseCase } from './get-course.uc';
import { CourseRepository } from '../ports/course.repository';
import { GetCourseDTO } from '../dto/get-course.dto';
import { NotFoundException } from '@nestjs/common';

describe('GetCourseUseCase', () => {
  let mockRepo: jest.Mocked<CourseRepository>;
  let useCase: GetCourseUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<CourseRepository>;

    useCase = new GetCourseUseCase(mockRepo);
  });

  it('debe lanzar error si el curso no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);
    const dto: GetCourseDTO = { id: 99 } as any;

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('debe retornar el curso si existe', async () => {
    const mockCourse = { id: 1, code: 'MATH101' };
    mockRepo.findById.mockResolvedValue(mockCourse as any);

    const dto: GetCourseDTO = { id: 1 } as any;
    const result = await useCase.execute(dto);

    expect(result).toEqual(mockCourse);
    expect(mockRepo.findById).toHaveBeenCalledWith(1);
  });
});
