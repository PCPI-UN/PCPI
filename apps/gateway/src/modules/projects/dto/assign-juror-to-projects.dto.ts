import {
  IsNotEmpty,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignJurorToProjectsDto {
  @ApiProperty({
    description: 'User ID of the juror to be assigned',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  userId: number;

  @ApiProperty({
    description: 'Array of project IDs to assign the juror to',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  projectIds: number[];
}
