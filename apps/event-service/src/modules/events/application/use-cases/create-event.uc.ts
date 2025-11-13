import { Inject, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CreateEventUC {
  constructor(
    @Inject('EventRepository') private readonly repo: any, // ✅ Debe coincidir con el token STRING
  ) {}

  async execute(input: any) {
    if (!input.name?.trim()) throw new Error('Event name is required');

    

    

    return this.repo.create({
      organizationId: input.organizationId,
      name: input.name,
      description: input.description,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable ?? false,
      inscriptionDeadline: new Date(input.inscriptionDeadline),
      evaluationsOpened: input.evaluationsOpened ?? false,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      location: input.location ?? null, 
      active: true,
      //createdByUserId: input.createdByUserId ?? 1,
    });
  }
}
