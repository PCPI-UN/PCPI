import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, Max, IsNotEmpty } from 'class-validator';


export class ListEventMembersDTO {
  @ApiProperty({
    description: 'ID of the event to filter members',
    example: 1,
  })
  @IsNumber() @IsPositive() @IsNotEmpty()
  eventId: number;

  @ApiProperty({
    description: 'ID of the role to filter members',
    example: 2,
  })
  @IsNumber() @IsPositive() @IsOptional()
  roleId?: number;

  @ApiProperty({
    description: 'Maximum number of members to return (max 20)',
    example: 20,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  @Max(20, { message: 'limit cannot exceed 20' })
  limit?: number = 20;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsNumber() @IsPositive() @IsOptional()
  page?: number = 1;
}