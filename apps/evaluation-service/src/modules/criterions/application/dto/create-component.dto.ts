import { IsString, IsNumber, IsNotEmpty, IsPositive, Max } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  @Max(1)
  weight: number;
}
