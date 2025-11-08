import { TypedDocument } from "../../domain/entities/project.entity";

export interface AddDocumentFromUrlDTO {
  projectId: number;
  url: string;
  type: TypedDocument
}
