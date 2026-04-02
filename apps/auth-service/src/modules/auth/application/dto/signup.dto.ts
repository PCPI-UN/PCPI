import { IsEmail, IsNotEmpty, IsString, MinLength, IsPhoneNumber, IsOptional } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsPhoneNumber('CO')
  @IsOptional()
  phone?: string;
}