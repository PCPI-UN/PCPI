import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddProjectDocumentsMultipartDto {
  @ApiProperty({
    description:
      'JSON string array of document metadata (type). ' +
      'The number of entries must match the number of uploaded files.',
    example: JSON.stringify([
      { type: 'POSTER' },
      { type: 'SUPPORTING_DOCUMENT' },
    ]),
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  documents: string;

  @ApiProperty({
    description:
      'Document files (should match the order and count of documents metadata)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: true,
  })
  files?: Express.Multer.File[];
}
