import { IsInt } from 'class-validator';

export class DeactivateUserDto {
  @IsInt()
  id: number;
}
