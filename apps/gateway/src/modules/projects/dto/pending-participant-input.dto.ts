import { IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PendingParticipantInputDto {
  @ApiProperty({
    description: 'First name of the participant',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the participant',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Email address of the participant',
    example: 'john.doe@university.edu',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Student identification code',
    example: '1045667814 (NationalID) or 2021123456 (UniversityID)',
  })
  @IsString()
  @IsNotEmpty()
  studentCode: string;

  @ApiProperty({
    description: 'Current semester of the participant',
    example: '6',
  })
  @IsNumberString()
  @IsNotEmpty()
  semester: string;

  @ApiProperty({
    description: 'Academic career or program of the participant',
    example: 'ing_sistemas',
  })
  @IsString()
  @IsNotEmpty()
  career: string;
}
