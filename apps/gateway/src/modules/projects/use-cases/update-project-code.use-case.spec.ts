import { of } from 'rxjs';
import { UpdateProjectCodeUseCase } from './update-project-code.use-case';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectState } from '@app/common/generated/project';

describe('UpdateProjectCodeUseCase', () => {
  const mockGetService = (service: any) => ({ getService: () => service });

  it('updates code when project in REQUEST_CHANGES and user is participant', async () => {
    const project = { id: 1, state: ProjectState.REQUEST_CHANGES, participants: [{ userId: 10 }] } as any;
    const projectsService = {
      getProjectComplete: () => of({ items: [project] }),
      updateProject: jest.fn(() => of({})),
    };

    // @ts-ignore
    const useCase = new UpdateProjectCodeUseCase(mockGetService(projectsService));

    await expect(useCase.execute(1, 'CODE-1', 10)).resolves.toBeUndefined();
    expect(projectsService.updateProject).toHaveBeenCalledWith({ id: 1, projectCode: 'CODE-1' });
  });

  it('throws NotFoundException when project not found', async () => {
    const projectsService = { getProjectComplete: () => of({ items: [] }) };
    // @ts-ignore
    const useCase = new UpdateProjectCodeUseCase(mockGetService(projectsService));

    await expect(useCase.execute(1, 'CODE', 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequestException when state is not REQUEST_CHANGES', async () => {
    const project = { id: 1, state: ProjectState.APPROVED, participants: [{ userId: 1 }] } as any;
    const projectsService = { getProjectComplete: () => of({ items: [project] }) };
    // @ts-ignore
    const useCase = new UpdateProjectCodeUseCase(mockGetService(projectsService));

    await expect(useCase.execute(1, 'CODE', 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws ForbiddenException when user not a participant', async () => {
    const project = { id: 1, state: ProjectState.REQUEST_CHANGES, participants: [{ userId: 2 }] } as any;
    const projectsService = { getProjectComplete: () => of({ items: [project] }) };
    // @ts-ignore
    const useCase = new UpdateProjectCodeUseCase(mockGetService(projectsService));

    await expect(useCase.execute(1, 'CODE', 1)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
