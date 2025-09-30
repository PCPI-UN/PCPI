import {
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsInt()
  id: number;

  @IsString()
  @MinLength(2)
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsPhoneNumber('CO')
  @IsOptional()
  phone?: string;
}
