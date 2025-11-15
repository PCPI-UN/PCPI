import { IsInt, Min } from 'class-validator';

export class DeleteEventDTO {
  @IsInt()
  @Min(1)
  id: number;
}
