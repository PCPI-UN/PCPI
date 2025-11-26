

export abstract class ProjectServicePort {
    abstract isJurorAssigned(
        projectId: number,
        userId: number,
        eventId: number,
        roleId: number,
    ): Promise<boolean>;
}
