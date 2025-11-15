import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetJurorMembershipDTO {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  eventId: number;
}
