import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventMemberDTO {
  @IsInt() @Min(1)
  userId: number;

  @IsInt() @Min(1)
  eventId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  roleId: number;
}