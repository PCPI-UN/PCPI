import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsArray, Min } from 'class-validator';
import { InvitationTargetType } from '../../domain/entities/invitation.entity';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(InvitationTargetType)
  @IsNotEmpty()
  targetType: InvitationTargetType;

  @IsInt()
  @Min(1)
  targetId: number;

  @IsInt()
  @Min(1)
  expiresAt: number; // Unix timestamp

  @IsInt()
  @Min(1)
  invitedByUserId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds: number[] = [];
}