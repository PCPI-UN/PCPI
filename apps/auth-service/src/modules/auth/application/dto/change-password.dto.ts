import { IsInt, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      },
    )
  newPassword: string;
}