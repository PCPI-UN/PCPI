import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteComponentDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
