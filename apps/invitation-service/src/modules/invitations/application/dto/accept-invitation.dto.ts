import { IsNotEmpty, IsOptional, IsString, MinLength, IsInt, Min } from 'class-validator';

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

  @IsInt()
  @Min(0)
  @IsOptional()
  studentCode?: number;
}