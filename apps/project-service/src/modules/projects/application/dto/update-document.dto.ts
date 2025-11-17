import { Status, TypedDocument } from "../../domain/entities/project.entity";

export class UpdateProjectDocumentDTO {
  id: number; // id del documento
  // Todos opcionales (patch)
  type?: TypedDocument;
  state?: Status;
  url?: string;
}