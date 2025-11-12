import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class DeleteEventDTO {
  @ApiProperty({
    description: 'ID of the event to delete',
    example: 123,
  })
  @IsNumber() @IsPositive() @IsNotEmpty()
  id: number;
}
