import { CreateCourseUseCase } from './create-course.uc';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { CreateCourseDTO } from '../dto/create-course.dto';
import { BadRequestException } from '@nestjs/common';

describe('CreateCourseUseCase', () => {
  let mockRepo: jest.Mocked<CourseRepository>;
  let useCase: CreateCourseUseCase;

  beforeEach(() => {
    mockRepo = {
      existsByEventAndCode: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<CourseRepository>;

    useCase = new CreateCourseUseCase(mockRepo);
  });

  it('debe lanzar error si el código ya existe en el evento', async () => {
    mockRepo.existsByEventAndCode.mockResolvedValue(true);

    const dto: CreateCourseDTO = {
      eventId: 1,
      code: 'MATH101',
      description: 'Curso de matemáticas',
    } as any;

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('debe crear el curso si el código no existe', async () => {
    mockRepo.existsByEventAndCode.mockResolvedValue(false);
    const dto: CreateCourseDTO = {
      eventId: 1,
      code: 'MATH101',
      description: 'Curso de matemáticas',
    } as any;

    const expectedCourse = { id: 1, ...dto };
    mockRepo.create.mockResolvedValue(expectedCourse as any);

    const result = await useCase.execute(dto);

    expect(mockRepo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedCourse);
  });
});
