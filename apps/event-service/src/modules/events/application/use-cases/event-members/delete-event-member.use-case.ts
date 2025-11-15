import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { EventMemberRepository } from '../../../domain/repositories/event-member.repository';
import { EventRepository } from '../../../domain/repositories/event.repository';
import { DeleteEventMemberDTO } from '../../dto/event-members/delete-event-member.dto';

@Injectable()
export class DeleteEventMemberUseCase {
  private readonly logger = new Logger(DeleteEventMemberUseCase.name);

  constructor(
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute(input: DeleteEventMemberDTO): Promise<void> {
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new RpcException({
        code: 5,
        message: `Event with ID ${input.eventId} not found`,
      });
    }

    const existingMember = await this.eventMemberRepository.findActiveByUserAndEvent(
      input.userId,
      input.eventId,
    );

    if (!existingMember) {
      throw new RpcException({
        code: 5,
        message: `Active membership not found for user ${input.userId} in event ${input.eventId}`,
      });
    }

    await this.eventMemberRepository.softDelete(input.userId, input.eventId);

    this.logger.log(
      `Successfully soft-deleted membership for user ${input.userId} in event ${input.eventId}`,
    );
  }
}