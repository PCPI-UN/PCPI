import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { CreateInvitationDto } from '../dto/create-invitation.dto';
import { Invitation, InvitationStatus, InvitationTargetType } from '../../domain/entities/invitation.entity';
import { InvitationRole } from '../../domain/entities/invitation-role.entity';
import { InvitationRepositoryPort } from '../../domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from '../../domain/repositories/invitation-role.repository.port';

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
    private readonly invitationRoleRepository: InvitationRoleRepositoryPort,
  ) {}

  async execute(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    const { email, targetType, targetId, expiresAt, invitedByUserId, roleIds } = createInvitationDto;

    if (expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Expiration date must be in the future',
      });
    }

    // Generar token único
    const token = this.generateUniqueToken();

    // Crear la invitación
    const invitation = new Invitation(
      randomUUID(),
      token,
      email,
      targetType as InvitationTargetType,
      targetId,
      InvitationStatus.PENDING,
      expiresAt,
      invitedByUserId,
    );

    // Guardar la invitación
    const savedInvitation = await this.invitationRepository.save(invitation);

    // Guardar los roles asociados
    if (roleIds && roleIds.length > 0) {
      const invitationRoles = roleIds.map(roleId => 
        new InvitationRole(savedInvitation.id, roleId)
      );
      
      for (const invitationRole of invitationRoles) {
        await this.invitationRoleRepository.save(invitationRole);
      }
    }

    return savedInvitation;
  }

  private generateUniqueToken(): string {
    // Generar un token único usando crypto
    return randomUUID() + '-' + Date.now().toString(36);
  }
}