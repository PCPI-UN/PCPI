import { ApproveProjectUC } from "../src/modules/projects/application/use-cases/approve-project.uc";



describe('ApproveProjectUC', () => {
  it('aprueba y envía invitaciones a todos los pending', async () => {
    const projectRepo = {
      findById: jest.fn().mockResolvedValue({ id: 10, state: 'UNDER_REVIEW' }),
      setProjectState: jest.fn().mockResolvedValue(undefined),
      listPendingsByProjectId: jest.fn().mockResolvedValue([
        { email: 'a@mail.com', firstName: 'A', lastName: null },
        { email: 'b@mail.com', firstName: 'B', lastName: 'Doe' },
      ]),
      markPendingsInvited: jest.fn().mockResolvedValue(2),
    };

    const invitation = {
      createInvitation: jest.fn().mockResolvedValue({ id: 'inv-1' }),
    };

    const uc = new ApproveProjectUC(
      // @ts-expect-error partial mock
      projectRepo,
      // @ts-expect-error partial mock
      invitation,
    );

    await uc.execute({ id: 10, actingUserId: 999 });

    expect(projectRepo.setProjectState).toHaveBeenCalledWith(10, 'APPROVED');
    expect(invitation.createInvitation).toHaveBeenCalledTimes(2);
    expect(invitation.createInvitation).toHaveBeenNthCalledWith(1, expect.objectContaining({
      email: 'a@mail.com', targetType: 'PROJECT', targetId: 10,
    }));
    expect(projectRepo.markPendingsInvited).toHaveBeenCalledWith(10, ['a@mail.com','b@mail.com'], expect.any(Date));
  });
});
