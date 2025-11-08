import { JurorKey } from "../../domain/entities/project.entity";

export interface ListProjectsAssignedToJurorDTO {
  juror: JurorKey;
  page?: number;     // default 1
  pageSize?: number; // default 20
}