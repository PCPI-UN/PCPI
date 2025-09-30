import { IsInt, IsNotEmpty } from 'class-validator';

export class GetUserDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
