import { BadRequestException } from '@nestjs/common';
import { EvaluationType } from '../../../../common/constants/evaluation-type.constants';
import { ScoreValidator } from '../../domain/ports/score-validator.port';
import { FinalProjectsScoreValidator } from './final-projects-score.validator';
import { ZeroToFiveScoreValidator } from './zero-to-five-score.validator';

export class ScoreValidatorFactory {
  static create(evaluationType: EvaluationType): ScoreValidator {
    switch (evaluationType) {
      case EvaluationType.FINAL_PROJECTS:
        return new FinalProjectsScoreValidator();

      case EvaluationType.ZERO_TO_FIVE:
        //Sistema para la Hackaton pero con un nombre diferente
        return new ZeroToFiveScoreValidator();

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
