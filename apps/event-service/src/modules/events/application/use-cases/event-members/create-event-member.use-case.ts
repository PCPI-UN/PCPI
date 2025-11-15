import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EventMemberRepository } from '@events/domain/repositories/event-member.repository';
import { EventRepository } from '@events/domain/repositories/event.repository';
import { CreateEventMemberDTO } from '@events/application/dto/event-members/create-event-member.dto';
import { EventMember } from '@events/domain/entities/event-member.entity';
import { AuthGrpcClient } from '@common/grpc-clients/auth-grpc.client';

@Injectable()
export class CreateEventMemberUseCase {
  private readonly logger = new Logger(CreateEventMemberUseCase.name);

  constructor(
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly eventRepository: EventRepository,
    private readonly authGrpcClient: AuthGrpcClient,
  ) {}

  async execute(input: CreateEventMemberDTO): Promise<EventMember> {
    const event = await this.eventRepository.findById(input.eventId);
    if (!event) {
      throw new RpcException({
        code: 5,
        message: `Event with ID ${input.eventId} not found`,
      });
    }

    // 2. Validate event is accepting members
    const now = new Date();

    if (!event.active) {
      throw new RpcException({
        code: 9,
        message: 'Event is not active and cannot accept new members',
      });
    }

    if (!event.isPubliclyJoinable) {
      throw new RpcException({
        code: 9,
        message: 'Event is not publicly joinable',
      });
    }

    // TODO: We should check first if the role being passed is a Participant. If not (Juror), we can allow
    // adding that member

    // TODO: if now > event.endDate, we should not allow new members
    if (now > event.inscriptionDeadline) {
      throw new RpcException({
        code: 9,
        message: 'Event inscription deadline has passed',
      });
    }

    try {
      const user = await lastValueFrom(this.authGrpcClient.getUser(input.userId));
      if (!user) {
        throw new RpcException({
          code: 3,
          message: `User with ID ${input.userId} not found`,
        });
      }
    } catch (error) {
      this.logger.error(`Error fetching user ${input.userId}: ${error.message}`);
      throw new RpcException({
        code: 3,
        message: `User with ID ${input.userId} not found`,
      });
    }

    try {
      const rolesResponse = await lastValueFrom(
        this.authGrpcClient.getRolesByIds([input.roleId]),
      );

      if (!rolesResponse.roles || rolesResponse.roles.length === 0) {
        throw new RpcException({
          code: 3,
          message: `Role with ID ${input.roleId} not found`,
        });
      }

      const role = rolesResponse.roles[0];
      if (role.scope !== 'EVENT') {
        throw new RpcException({
          code: 3,
          message: `Role with ID ${input.roleId} is not an EVENT-scoped role (scope: ${role.scope})`,
        });
      }
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error fetching role ${input.roleId}: ${error.message}`);
      throw new RpcException({
        code: 3,
        message: `Role with ID ${input.roleId} not found`,
      });
    }

    const existingMember = await this.eventMemberRepository.findActiveByUserAndEvent(
      input.userId,
      input.eventId,
    );

    if (existingMember) {
      this.logger.log(
        `User ${input.userId} already has an active membership in event ${input.eventId} with role ${existingMember.roleId}. Returning existing membership (idempotent).`,
      );
      return existingMember;
    }

    return this.eventMemberRepository.create({
      userId: input.userId,
      eventId: input.eventId,
      roleId: input.roleId,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}