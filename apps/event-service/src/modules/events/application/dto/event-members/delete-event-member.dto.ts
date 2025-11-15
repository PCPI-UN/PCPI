import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteEventMemberDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  eventId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;
}