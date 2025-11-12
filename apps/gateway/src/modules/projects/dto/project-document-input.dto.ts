import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TypedDocument {
  POSTER = 'POSTER',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT',
}

export class ProjectDocumentInputDto {
  @ApiProperty({
    description: 'URL to the document file',
    example: 'https://storage.example.com/projects/poster-123.pdf',
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: 'Type of document',
    enum: TypedDocument,
    example: TypedDocument.POSTER,
  })
  @IsEnum(TypedDocument)
  @IsNotEmpty()
  type: TypedDocument;
}
