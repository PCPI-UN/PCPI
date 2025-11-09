import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class ListEventMembersDTO {
  @IsInt()
  @IsPositive()
  eventId: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  roleId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20, { message: 'limit cannot exceed 20' })
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;
}