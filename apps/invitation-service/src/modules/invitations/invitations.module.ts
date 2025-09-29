import { Module } from '@nestjs/common';
import { PrismaModule } from '@common/prisma/prisma.module';

// Application Layer
import { CreateInvitationUseCase } from '@invitations/application/use-cases/create-invitation.use-case';

// Domain Layer
import { InvitationRepositoryPort } from '@invitations/domain/repositories/invitation.repository.port';

// Infrastructure Layer
import { PrismaInvitationRepository } from '@invitations/infrastructure/prisma/prisma-invitation.repository';

// Interface Layer
import { InvitationController } from '@invitations/interface/grpc/invitation.controller';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [InvitationController],
  providers: [
    CreateInvitationUseCase,
    {
      provide: InvitationRepositoryPort,
      useClass: PrismaInvitationRepository,
    },
  ],
})
export class InvitationsModule {}