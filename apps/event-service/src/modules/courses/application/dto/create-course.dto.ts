import { IsInt, IsString, IsNotEmpty, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateCourseDTO {
  @IsInt()
  @Min(1)
  eventId: number;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
