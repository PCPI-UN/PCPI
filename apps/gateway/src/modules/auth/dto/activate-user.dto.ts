import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ActivateUserDto {
  @ApiProperty({
    description: 'Activation token sent to user email',
    example: '01234567890abcdef01234567890abcdef01234567890abcdef01234567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
