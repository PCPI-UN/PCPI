import {
  IsInt,
  Min,
  IsString,
  IsOptional,
  IsBoolean,
  IsISO8601,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateEventDTO {
  @IsInt()
  @Min(1)
  id: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'accessCode must contain only alphanumeric characters and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  accessCode?: string;

  @IsOptional()
  @IsBoolean()
  isPubliclyJoinable?: boolean;

  @IsOptional()
  @IsISO8601()
  inscriptionDeadline?: string;

  @IsOptional()
  @IsBoolean()
  evaluationsOpened?: boolean;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;
}
