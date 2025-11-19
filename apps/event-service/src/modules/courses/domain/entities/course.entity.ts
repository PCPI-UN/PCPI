export class Course {
  constructor(
    public id: number,
    public eventId: number,
    public code: string,
    public description?: string | null,
    public active: boolean = true,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
