import { Injectable } from '@nestjs/common';
import { EventMemberRepository } from '../../../domain/repositories/event-member.repository';
import { GetJurorMembershipDTO } from '../../dto/event-members/get-juror-membership.dto';
import { AuthGrpcClient } from '@common/grpc-clients/auth-grpc.client';
import { firstValueFrom } from 'rxjs';

export interface JurorMembership {
  memberUserId: number;
  memberEventId: number;
  memberRoleId: number;
}

@Injectable()
export class GetJurorMembershipUseCase {
  constructor(
    
    private readonly eventMemberRepository: EventMemberRepository,
    private readonly authGrpcClient: AuthGrpcClient,
  ) {}

  async execute(input: GetJurorMembershipDTO): Promise<JurorMembership | null> {
    const membership = await this.eventMemberRepository.findByUserAndEvent(
      input.userId,
      input.eventId,
    );

    if (!membership || !membership.active) {
      return null;
    }

    // 2. Query auth-service to get role information
    const rolesResponse = await firstValueFrom(
      this.authGrpcClient.getRolesByIds([membership.roleId]),
    );

    // If role not found, return null
    if (!rolesResponse.roles || rolesResponse.roles.length === 0) {
      return null;
    }

    const role = rolesResponse.roles[0];

    // Check if the role is a Juror role (scope: EVENT, name: Juror)
    const isJurorRole =
      role.scope === 'EVENT' &&
      role.name.toLowerCase() === 'juror';

    if (!isJurorRole) {
      return null;
    }

    // We return the juror membership information
    return {
      memberUserId: membership.userId,
      memberEventId: membership.eventId,
      memberRoleId: membership.roleId,
    };
  }
}
