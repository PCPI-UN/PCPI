import { IsInt, IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';

export class UpdateComponentDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  weight?: number;
}
