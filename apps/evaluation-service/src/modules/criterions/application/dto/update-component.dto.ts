import { IsInt, IsString, IsNumber, IsOptional, IsPositive, Max, IsNotEmpty } from 'class-validator';

export class UpdateComponentDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsPositive()
  @Max(1)
  @IsOptional()
  weight?: number;
}
