import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { InvitationRepositoryPort } from '@invitations/domain/repositories/invitation.repository.port';
import { CreateInvitationDto } from '@invitations/application/dto/invitation.dto';
import { Invitation, InvitationStatus, InvitationRole } from '@invitations/domain/entities/invitation.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly invitationRepository: InvitationRepositoryPort,
  ) {}

  async execute(createInvitationDto: CreateInvitationDto): Promise<Invitation> {
    const { email, targetType, targetId, invitedByUserId, roleIds, expiresAt } = createInvitationDto;

    // Validar que la fecha de expiración sea futura
    const expirationDate = new Date(expiresAt * 1000); // Convertir de Unix timestamp
    if (expirationDate <= new Date()) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Expiration date must be in the future',
      });
    }

    // Generar token único
    const token = this.generateInvitationToken();

    // Crear roles de invitación
    const invitationRoles = roleIds.map(roleId => 
      new InvitationRole('', roleId) // El ID se asignará después de crear la invitación
    );

    // Crear entidad de invitación
    const invitation = new Invitation(
      randomUUID(),
      token,
      email,
      targetType,
      targetId,
      InvitationStatus.PENDING,
      expirationDate,
      invitedByUserId,
      null, // invitedUserId se asignará cuando se acepte
      new Date(), // createdAt
      new Date(), // updatedAt
      invitationRoles,
    );

    try {
      const savedInvitation = await this.invitationRepository.save(invitation);
      return savedInvitation;
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Failed to create invitation',
      });
    }
  }

  private generateInvitationToken(): string {
    // Generar un token único para la invitación
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `inv_${timestamp}_${randomPart}`;
  }
}
