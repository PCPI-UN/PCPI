import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsArray,
  Min,
  IsString,
} from 'class-validator';
import { InvitationTargetType } from '../../../../../invitation-service/src/modules/invitations/domain/entities/invitation.entity';

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

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
