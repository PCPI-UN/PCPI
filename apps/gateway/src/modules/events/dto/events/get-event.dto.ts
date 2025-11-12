import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsNotEmpty } from 'class-validator';
export class GetEventDTO {
  @ApiProperty({
    description: 'ID of the event to retrieve',
    example: 123,
  })
  @IsNumber() @IsPositive() @IsNotEmpty()
  id: number;
}
