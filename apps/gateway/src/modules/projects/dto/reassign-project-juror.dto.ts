import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReassignProjectJurorDto {
  @ApiProperty({
    description: 'Project ID for which the juror is being reassigned',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  projectId: number;

  @ApiProperty({
    description: 'User ID of the current juror',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  fromUserId: number;

  @ApiProperty({
    description: 'User ID of the new juror to be assigned',
    example: 8,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  toUserId: number;
}
