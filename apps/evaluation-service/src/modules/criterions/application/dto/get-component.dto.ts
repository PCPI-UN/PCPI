import { IsInt, IsNotEmpty } from 'class-validator';

export class GetComponentDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
