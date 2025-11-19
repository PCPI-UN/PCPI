import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { TypedDocument } from './project-document-input.dto';

export enum DocumentStatusFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateProjectDocumentDto {
  @ApiPropertyOptional({
    description: 'New URL for the document',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  @Transform(({ value }: { value: any }) => value === '' ? undefined : value)
  url?: string;

  @ApiPropertyOptional({
    description: 'New document type',
    enum: TypedDocument,
    example: TypedDocument.POSTER,
  })
  @IsOptional()
  @IsEnum(TypedDocument)
  @Transform(({ value }: { value: any }) => value === '' ? undefined : value)
  type?: TypedDocument;

  @ApiPropertyOptional({
    description: 'New document status',
    enum: DocumentStatusFilter,
    example: DocumentStatusFilter.ACTIVE,
  })
  @IsOptional()
  @IsEnum(DocumentStatusFilter)
  @Transform(({ value }: { value: any }) => value === '' ? undefined : value)
  state?: DocumentStatusFilter;
}
