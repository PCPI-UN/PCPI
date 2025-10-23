import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

interface Invitation {
  id: string;
  token: string;
  email: string;
  targetType: string;
  targetId: number;
  status: string;
  expiresAt: number;
  invitedByUserId: number;
  invitedUserId: number;
  createdAt: string;
  updatedAt: string;
  roleIds: number[];
}

// La firma del stub; Nest genera métodos TitleCase a partir del proto
interface InvitationServiceClient {
  CreateInvitation(
    req: Record<string, any>,
    meta?: Metadata,
  ): Promise<Invitation>;
}

@Injectable()
export class InvitationGrpcAdapter implements OnModuleInit {
  private svc!: InvitationServiceClient;

  constructor(@Inject('INVITATION_CLIENT') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.svc = this.client.getService<InvitationServiceClient>('InvitationService');
  }

  /**
   * Crea una invitación en invitation-service.
   * targetType: usa "PROJECT" para nuestro caso.
   * roleIds: opcional, si quieres asignar roles específicos desde aquí.
   */
  async createInvitation(input: {
    email: string;
    targetType: 'PROJECT' | 'EVENT' | 'PLATFORM';
    targetId: number;
    firstName?: string;
    lastName?: string;
    roleIds?: number[];
    invitedByUserId?: number; // el admin que aprobó
    dedupKey?: string;        // si tu request lo soporta
  }): Promise<Invitation> {
    const req: Record<string, any> = {
      email: input.email,
      targetType: input.targetType, // en tu proto es string, no enum
      targetId: input.targetId,
      firstName: input.firstName ?? '',
      lastName: input.lastName ?? '',
      roleIds: input.roleIds ?? [],
      invitedByUserId: input.invitedByUserId ?? 0,
    };
    if (input.dedupKey) req.dedupKey = input.dedupKey; // por si tu request lo soporta
    console.log('Creating invitation with data:', req);
    // Metadata con token de servicio (opcional)
    console.log('Preparing metadata for gRPC call',process.env.SVC_AUTH_TOKEN);
    const md = new Metadata();
    if (process.env.SVC_AUTH_TOKEN) {
      md.add('authorization', `Bearer ${process.env.SVC_AUTH_TOKEN}`);
    }
    console.log('Using metadata:', md.getMap());
    return this.svc.CreateInvitation(req, md);
  }
}