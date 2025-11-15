import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsISO8601,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
} from 'class-validator';

export class CreateEventDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'accessCode must contain only alphanumeric characters and hyphens',
  })
  @MinLength(3)
  @MaxLength(50)
  accessCode: string;

  @IsBoolean()
  isPubliclyJoinable: boolean = false;

  @IsISO8601()
  inscriptionDeadline: string;

  @IsBoolean()
  evaluationsOpened: boolean = false;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  createdByUserId?: number;
}
