import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';

export class DeleteEventDTO {
  @ApiProperty({
    description: 'ID of the event to delete',
    example: 123,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  id: number;
}
