import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
export class GetEventDTO {
  @ApiProperty({
    description: 'ID of the event to retrieve',
    example: 123,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  @Type(() => Number)
  id: number;
}
