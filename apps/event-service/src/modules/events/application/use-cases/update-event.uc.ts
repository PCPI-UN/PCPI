import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EventRepository } from '../../domain/repositories/event.repository';
import { UpdateEventDTO } from '../dto/update-event.dto';

@Injectable()
export class UpdateEventUC {
  constructor(private readonly repo: EventRepository) {}

  async execute(input: UpdateEventDTO) {
    const existing = await this.repo.findById(input.id);
    if (!existing) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: `Event with id ${input.id} not found`,
      });
    }

    // Date validation when dates are being updated
    const inscriptionDeadline = input.inscriptionDeadline
      ? new Date(input.inscriptionDeadline)
      : existing.inscriptionDeadline;
    const startDate = input.startDate
      ? new Date(input.startDate)
      : existing.startDate;
    const endDate = input.endDate ? new Date(input.endDate) : existing.endDate;

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

    if (input.accessCode && input.accessCode !== existing.accessCode) {
      const existingEvent = await this.repo.findByAccessCode(input.accessCode);
      if (existingEvent) {
        throw new RpcException({
          code: 6,
          message: `Event with accessCode "${input.accessCode}" already exists`,
        });
      }
    }


    return this.repo.update(input.id, {
      name: input.name,
      description: input.description,
      accessCode: input.accessCode,
      isPubliclyJoinable: input.isPubliclyJoinable,
      inscriptionDeadline: input.inscriptionDeadline
        ? new Date(input.inscriptionDeadline)
        : undefined,
      evaluationsOpened: input.evaluationsOpened,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      active: input.active,
      location: input.location ?? null,
    });
  }
}
