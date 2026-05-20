import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptInvitationDto {
  @ApiProperty({
    description: 'Invitation token received via email',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'Password for new users (required for pending users, optional for confirmed users)',
    example: 'SecurePassword123!',
    minLength: 8,
    required: false,
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'First name (optional, can be updated during acceptance)',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Last name (optional, can be updated during acceptance)',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Student code required for project invitation acceptance',
    example: '202312345',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  studentCode?: string;

  @ApiProperty({
    description: 'Microsoft access token (for signing in with Microsoft)',
    required: false,
  })
  @IsString()
  @IsOptional()
  microsoftToken?: string;
}
