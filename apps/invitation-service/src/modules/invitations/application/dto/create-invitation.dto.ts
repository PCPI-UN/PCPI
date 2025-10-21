import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsArray, Min, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
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

  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @IsInt()
  @Min(1)
  invitedByUserId: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds: number[] = [];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}