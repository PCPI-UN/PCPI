import { IsEmail, IsString, IsInt, IsArray, IsOptional, IsEnum, Min } from 'class-validator';
import { InvitationTargetType } from '@invitations/domain/entities/invitation.entity';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(InvitationTargetType)
  targetType: InvitationTargetType;

  @IsInt()
  @Min(1)
  targetId: number;

  @IsInt()
  @Min(1)
  invitedByUserId: number;

  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];

  @IsInt()
  @Min(1)
  expiresAt: number; // Unix timestamp
}

export class GetInvitationByTokenDto {
  @IsString()
  token: string;
}

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsInt()
  @Min(1)
  userId: number;
}

export class RejectInvitationDto {
  @IsString()
  token: string;
}
