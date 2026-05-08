import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class RemoveJurorFromProjectDto {
  @ApiProperty({
    description: 'Project ID',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  projectId: number;

  @ApiProperty({
    description: 'Juror User ID',
    example: 5,
    minimum: 1,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  jurorUserId: number;
}
