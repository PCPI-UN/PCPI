import { IsInt, Min, Max } from 'class-validator';

export class CreateEventMemberDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsInt()
  @Min(1)
  eventId: number;

  @IsInt()
  @Min(1)
  @Max(4)
  roleId: number;

  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
}