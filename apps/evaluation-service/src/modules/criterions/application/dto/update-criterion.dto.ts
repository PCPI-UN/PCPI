export class UpdateCriterionDto {
  id!: number;
  eventId?: number;
  name?: string;
  description?: string;
  weight?: number;
  active?: boolean;
  courseIds?: number[];
}
