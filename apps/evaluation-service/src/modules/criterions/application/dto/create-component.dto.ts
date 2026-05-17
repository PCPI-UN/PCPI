import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;
}
