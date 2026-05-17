import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetComponentDto {
  @ApiProperty({
    description: 'Component ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;
}
