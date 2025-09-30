import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBasicUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsPhoneNumber('CO')
  @IsOptional()
  phone?: string;
}
