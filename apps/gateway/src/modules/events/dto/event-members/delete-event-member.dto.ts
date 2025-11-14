import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNotEmpty} from 'class-validator';
export class DeleteEventMemberDTO {
  @ApiProperty({
    description: 'ID of the event from which the user will be removed',
    example: 1,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  eventId: number;

  @ApiProperty({
    description: 'ID of the user to be removed from the event',
    example: 1001,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  userId: number;
}