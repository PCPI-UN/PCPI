import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TypedDocument {
  LOGO = 'LOGO',
  POSTER = 'POSTER',
  SUPPORTING_DOCUMENT = 'SUPPORTING_DOCUMENT',
}

/**
 * DTO for project document metadata received from multipart/form-data
 * The actual file will be handled separately via FileFieldsInterceptor
 */
export class ProjectDocumentInputDto {
  @ApiProperty({
    description: 'Type of document',
    enum: TypedDocument,
    example: TypedDocument.POSTER,
  })
  @IsEnum(TypedDocument)
  @IsNotEmpty()
  type: TypedDocument;
}

/**
 * Internal DTO used after file upload to Azure Blob Storage
 * This contains the actual URL that will be sent to project-service
 */
export class ProjectDocumentWithUrlDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsEnum(TypedDocument)
  @IsNotEmpty()
  type: TypedDocument;
}
