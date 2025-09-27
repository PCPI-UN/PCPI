import { Injectable, Inject } from '@nestjs/common';
import { EventRepository } from '../ports/event.repository';
import { CreateEventDTO } from '../dto/create-event.dto';

@Injectable()
export class CreateEventUC {
  constructor(@Inject('EventRepository') private readonly repo: EventRepository) {}

  async execute(input: CreateEventDTO) {
    if (!input.name?.trim()) throw new Error('Name is required');

    const event = await this.repo.create({
      organizationId: input.organizationId, // si lo manejas en el DTO
      name: input.name,
      description: input.description,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable ?? false,
      inscriptionDeadline: new Date(input.inscriptionDeadline), // ✅ conversión
      evaluationsOpened: input.evaluationsOpened ?? false,
      startDate: new Date(input.startDate), // ✅ conversión
      endDate: new Date(input.endDate),     // ✅ conversión
      active: true, // default en schema, pero puedes fijarlo explícitamente
    });

    return event;
  }
}

