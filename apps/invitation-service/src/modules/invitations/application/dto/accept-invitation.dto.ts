import { IsNotEmpty, IsOptional, IsString, MinLength, IsInt, Min, MaxLength } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsOptional()
  studentCode?: string;
}