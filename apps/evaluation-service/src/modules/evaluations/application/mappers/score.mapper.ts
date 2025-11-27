export class ScoreMapper {
    private static readonly SCORE_TO_VALUE_MAP: Record<number, number> = {
        90: 4,
        75: 3,
        55: 2,
        25: 1,
    };

    private static readonly VALUE_TO_SCORE_MAP: Record<number, number> = {
        4: 90,
        3: 75,
        2: 55,
        1: 25,
    };

    /**
     * Maps stored score (90, 75, 55, 25) to original value (4, 3, 2, 1)
     * Used when returning data to frontend
     */
    static toOriginalValue(score: number): number {
        const rounded = Math.round(score);
        const value = this.SCORE_TO_VALUE_MAP[rounded];
        
        if (!value) {
            throw new Error(`Invalid score value: ${score}. Must be 90, 75, 55, or 25.`);
        }
        
        return value;
    }

    /**
     * Maps original value (4, 3, 2, 1) to stored score (90, 75, 55, 25)
     * Used when saving data to database
     */
    static toStoredScore(value: number): number {
        const rounded = Math.round(value);
        const score = this.VALUE_TO_SCORE_MAP[rounded];
        
        if (!score) {
            throw new Error(`Invalid value: ${value}. Must be 1, 2, 3, or 4.`);
        }
        
        return score;
    }
}
