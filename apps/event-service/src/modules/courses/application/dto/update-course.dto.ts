import { IsInt, IsString, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateCourseDTO {
  @IsInt()
  @Min(1)
  id: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
