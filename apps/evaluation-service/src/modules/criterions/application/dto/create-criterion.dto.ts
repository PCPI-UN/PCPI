export class CreateCriterionDto {
  eventId!: number;
  name!: string;
  description?: string;
  weight!: number;
  active!: boolean;
  courseIds!: number[];
}
