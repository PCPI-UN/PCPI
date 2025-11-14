import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsBoolean, IsPositive, IsOptional, IsNotEmpty} from 'class-validator';

export class CreateEventMemberDTO {
  @ApiProperty({
    description: 'ID of the user to be added as an event member',
    example: 1001,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'ID of the event to which the user will be added',
    example: 1,
  })
  @IsInt() @IsPositive() @IsNotEmpty()
  eventId: number;

  @ApiProperty({
    description: 'Role ID of the user in the event',
    example: 2,
  })
  @IsInt() @Min(1) @Max(4) @IsNotEmpty()
  roleId: number;

  @ApiProperty({
    description: 'Indicates if the event member is active',
    example: true,
  })
  @IsBoolean() @IsOptional()
  active?: boolean;

  @ApiProperty({
    description: 'Creation date of the event member record',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date of the event member record',
    example: '2024-01-02T00:00:00Z',
    required: false,
  })
  updatedAt: Date;
}