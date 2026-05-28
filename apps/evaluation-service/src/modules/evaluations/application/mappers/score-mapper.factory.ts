import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreMapper } from '../../domain/ports/score-mapper.port';
import { FinalProjectsScoreMapper } from './final-projects-score.mapper';
import { ZeroToFiveScoreMapper } from './zero-to-five-score.mapper';
import { ZeroToHundredScoreMapper } from './zero-to-hundred-score.mapper';

export class ScoreMapperFactory {
  static create(evaluationType: EvaluationType): ScoreMapper {
    switch (evaluationType) {
      case EvaluationType.FINAL_PROJECTS:
        return new FinalProjectsScoreMapper();

      case EvaluationType.ZERO_TO_FIVE:
        //Sistema para la Hackaton pero con un nombre diferente
        return new ZeroToFiveScoreMapper();

      case EvaluationType.ZERO_TO_HUNDRED:
        return new ZeroToHundredScoreMapper();

      default:
        throw new BadRequestException(
          `Unsupported evaluation type: ${evaluationType}`,
        );
    }
  }
}
