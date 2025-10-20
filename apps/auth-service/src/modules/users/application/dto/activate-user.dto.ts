import { IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ActivateUserDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
