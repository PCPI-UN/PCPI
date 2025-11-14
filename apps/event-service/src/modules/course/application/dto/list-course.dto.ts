import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCoursesDTO {
  @IsInt() @IsOptional()
  @Type(() => Number)
  eventId?: number;     //  para filtrar por evento

  @IsOptional()
  @Type(() => Boolean)
  onlyActive?: boolean;

  @IsInt() @IsOptional() @Min(1)
  @Type(() => Number)
  page?: number;        //  si tu UC usa paginación por página

  @IsInt() @IsOptional() @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @IsString() @IsOptional()
  @Type(() => String)
  q?: string;           // búsqueda por code/description

  @IsString() @IsOptional()
  @Type(() => String)
  pageToken?: string;   // opcional si luego implementas tokens
}
