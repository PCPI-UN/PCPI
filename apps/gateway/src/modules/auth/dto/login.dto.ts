import { LoginRequest } from '@app/common/generated/auth';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto implements LoginRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@iris.local',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Admin1234@',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
