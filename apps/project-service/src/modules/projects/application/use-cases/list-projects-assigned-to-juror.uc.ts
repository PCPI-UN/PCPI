import { Inject, Injectable } from "@nestjs/common";
import { ProjectRepository } from "../../domain/repositories/project.repository";
import { JurorKey } from "../../domain/entities/project.entity";
import { ListProjectsAssignedToJurorDTO } from "../dto/list-projects-assigned-to-juror.dto";




@Injectable()export class ListProjectsAssignedToJurorUC {
  constructor(@Inject('ProjectRepository') private readonly repo: ProjectRepository) {}
    async execute(input: ListProjectsAssignedToJurorDTO) {
        const page = input.page && input.page > 0 ? input.page : 1;
        const pageSize = input.pageSize && input.pageSize > 0 ? input.pageSize : 20;
        return this.repo.listAssignedToJuror(input.juror, { page, pageSize });
    }
}
