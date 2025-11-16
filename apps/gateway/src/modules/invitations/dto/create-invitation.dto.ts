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
import { ApiProperty } from '@nestjs/swagger';
import { InvitationTargetType } from '../../../../../invitation-service/src/modules/invitations/domain/entities/invitation.entity';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Type of target for the invitation',
    enum: InvitationTargetType,
    enumName: 'InvitationTargetType',
    example: InvitationTargetType.EVENT,
  })
  @IsEnum(InvitationTargetType)
  @IsNotEmpty()
  targetType: InvitationTargetType;

  @ApiProperty({
    description: 'ID of the target (event, project, or platform)',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  targetId: number;

  @ApiProperty({
    description: 'Array of role IDs to assign to the invited user',
    type: [Number],
    example: [1, 2],
    required: false,
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  roleIds?: number[];

  @ApiProperty({
    description: 'First name of the invited user',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the invited user',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
