import { IsInt, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export class IsPlatformStaffDto {
  @ValidateIf((o) => !o.email)
  @IsInt()
  userId?: number;

  @ValidateIf((o) => !o.userId)
  @IsEmail()
  email?: string;
}
