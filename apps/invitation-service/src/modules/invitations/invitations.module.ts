import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';

// Application 
import { CreateInvitationUseCase } from './application/use-cases/create-invitation.use-case';
import { GetInvitationByTokenUseCase } from './application/use-cases/get-invitation-by-token.use-case';
import { AcceptInvitationUseCase } from './application/use-cases/accept-invitation.use-case';
import { RejectInvitationUseCase } from './application/use-cases/reject-invitation.use-case';

// Domain 
import { InvitationRepositoryPort } from './domain/repositories/invitation.repository.port';
import { InvitationRoleRepositoryPort } from './domain/repositories/invitation-role.repository.port';

// Infrastructure 
import { PrismaInvitationRepository } from './infrastructure/prisma/prisma-invitation.repository';
import { PrismaInvitationRoleRepository } from './infrastructure/prisma/prisma-invitation-role.repository';

// Interface 
import { InvitationController } from './interface/grpc/invitation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InvitationController],
  providers: [
    // Use Cases
    CreateInvitationUseCase,
    GetInvitationByTokenUseCase,
    AcceptInvitationUseCase,
    RejectInvitationUseCase,
    
    // Repository Implementations
    {
      provide: InvitationRepositoryPort,
      useClass: PrismaInvitationRepository,
    },
    {
      provide: InvitationRoleRepositoryPort,
      useClass: PrismaInvitationRoleRepository,
    },
  ],
  exports: [
    CreateInvitationUseCase,
    GetInvitationByTokenUseCase,
    AcceptInvitationUseCase,
    RejectInvitationUseCase,
  ],
})
export class InvitationsModule {}