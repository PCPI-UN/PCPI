import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EventRepository } from '@events/domain/repositories/event.repository';
import { CreateEventDTO } from '@events/application/dto/create-event.dto';

@Injectable()
export class CreateEventUC {
  constructor(private readonly repo: EventRepository) {}

  async execute(input: CreateEventDTO) {
    const inscriptionDeadline = new Date(input.inscriptionDeadline);
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (inscriptionDeadline >= startDate) {
      throw new RpcException({
        code: 3,
        message:
          'Validation failed: inscriptionDeadline must be before startDate',
      });
    }

    if (startDate >= endDate) {
      throw new RpcException({
        code: 3,
        message: 'Validation failed: startDate must be before endDate',
      });
    }

    const existingEvent = await this.repo.findByAccessCode(input.accessCode);
    if (existingEvent) {
      throw new RpcException({
        code: 6,
        message: `Event with accessCode "${input.accessCode}" already exists`,
      });
    }

    return this.repo.create({
      name: input.name,
      description: input.description,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable ?? false,
      inscriptionDeadline,
      evaluationsOpened: input.evaluationsOpened ?? false,
      startDate,
      endDate,
      location: input.location ?? null,
      active: true,
      createdByUserId: input.createdByUserId ?? 0,
    });
  }
}
