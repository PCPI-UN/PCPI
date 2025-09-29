export enum InvitationStatus {
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export enum InvitationTargetType {
  EVENT = 'EVENT',
}

export class Invitation {
  constructor(
    public readonly id: string,
    public token: string,
    public email: string,
    public targetType: InvitationTargetType,
    public targetId: number,
    public status: InvitationStatus,
    public expiresAt: Date,
    public invitedByUserId: number,
    public invitedUserId?: number | null,
    public createdAt?: Date,
    public updatedAt?: Date,
    public roles?: InvitationRole[],
  ) {}
}

export class InvitationRole {
  constructor(
    public invitationId: string,
    public roleId: number,
  ) {}
}
