// Iris/apps/evaluation-service/src/domain/ports/score-mapper.port.ts

export interface ScoreMapper {
  /**
   * Maps a raw score to a standardized score according to specific evaluation rules.
   * @param score The raw score to map.
   * @returns The mapped score as a number.
   */
  map(score: number): number;
}
