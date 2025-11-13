import { UpdateCourseUseCase } from './update-course.uc';
import { CourseRepository } from '../../domain/repositories/course.repository';
import { UpdateCourseDTO } from '../dto/update-course.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UpdateCourseUseCase', () => {
  let mockRepo: jest.Mocked<CourseRepository>;
  let useCase: UpdateCourseUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      update: jest.fn(),
      existsByEventAndCode: jest.fn(),
    } as unknown as jest.Mocked<CourseRepository>;

    useCase = new UpdateCourseUseCase(mockRepo);
  });

  it('debe lanzar error si el curso no existe', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const dto: UpdateCourseDTO = { id: 5 } as any;
    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
  });

  it('debe lanzar error si el nuevo código ya existe en el evento', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, code: 'OLD', eventId: 1 } as any);
    mockRepo.existsByEventAndCode.mockResolvedValue(true);

    const dto: UpdateCourseDTO = { id: 1, code: 'NEW' } as any;

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('debe actualizar correctamente si el curso existe y el código es único', async () => {
    mockRepo.findById.mockResolvedValue({ id: 1, code: 'OLD', eventId: 1 } as any);
    mockRepo.existsByEventAndCode.mockResolvedValue(false);
    mockRepo.update.mockResolvedValue({ id: 1, code: 'NEW' } as any);

    const dto: UpdateCourseDTO = { id: 1, code: 'NEW', description: 'Updated' } as any;

    const result = await useCase.execute(dto);

    expect(mockRepo.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ code: 'NEW', description: 'Updated' }),
    );
    expect(result).toEqual({ id: 1, code: 'NEW' });
  });
});
