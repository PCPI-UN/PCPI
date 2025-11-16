import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class InviteJurorToEventDto {
  @ApiProperty({
    description: 'Email address of the juror to invite',
    example: 'juror@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'First name of the juror',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the juror',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
