// apps/event-service/src/modules/events/application/dto/list-events-page.dto.ts
import { IsInt, Min, Max, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEventsPageDTO {
  @Type(() => Number)
  @IsInt() @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt() @Min(1) @Max(100)
  limit: number = 10;

  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @IsBoolean()
  onlyActive?: boolean;
}
