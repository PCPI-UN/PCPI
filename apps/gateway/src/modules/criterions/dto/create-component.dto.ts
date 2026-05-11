import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateComponentDto {
  @ApiProperty({
    description: 'Name of the component',
    example: 'Design Quality',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Weight of the component (0 to 1)',
    example: 0.4,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0.01)
  @Max(1)
  @Type(() => Number)
  weight: number;
}
