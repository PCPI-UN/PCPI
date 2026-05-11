import { EvaluationType } from "../../../../common/constants/evaluation-type.constants";

export interface ScoreMapper {
  map(score: number, evaluationType: EvaluationType): number;
}
