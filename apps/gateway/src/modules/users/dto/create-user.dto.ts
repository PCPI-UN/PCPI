import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsInt,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}
