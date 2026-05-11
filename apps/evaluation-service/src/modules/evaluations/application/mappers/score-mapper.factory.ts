import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreMapper } from '../../domain/ports/score-mapper.port';
import { FinalProjectsScoreMapper } from './final-projects-score.mapper';

export class ScoreMapperFactory {
    static create(evaluationType: EvaluationType): ScoreMapper {
        switch (evaluationType) {
            case EvaluationType.FINAL_PROJECTS:
                return new FinalProjectsScoreMapper();

            case EvaluationType.ZERO_TO_FIVE:
            case EvaluationType.ZERO_TO_HUNDRED:
                throw new BadRequestException(
                    `Evaluation type ${evaluationType} is not implemented yet.`,
                );

            default:
                throw new BadRequestException(
                    `Unsupported evaluation type: ${evaluationType}`,
                );
        }
    }
}
