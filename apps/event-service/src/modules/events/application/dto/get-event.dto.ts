import { IsInt, Min } from 'class-validator';

export class GetEventDTO {
  @IsInt()
  @Min(1)
  id: number;
}
