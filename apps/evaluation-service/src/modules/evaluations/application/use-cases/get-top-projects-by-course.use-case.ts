import { Injectable } from "@nestjs/common";
import { EvaluationRepositoryPort, TopProject } from "@evaluations/domain/repositories/evaluation.repository.port";
import { GetTopProjectsByCourseDto } from "@evaluations/application/dto/get-top-projects-by-course.dto";

@Injectable()
export class GetTopProjectsByCourseUseCase {
    constructor(
        private readonly evaluationRepository: EvaluationRepositoryPort,
    ) {}

    async execute(dto: GetTopProjectsByCourseDto): Promise<TopProject[]> {
        return this.evaluationRepository.getTopProjectsByCourse(dto.courseId);
    }
}
