export interface CreateEventMember {
  userId: number;
  eventId: number;
  roleId: number;
  active?: boolean; // opcional porque en schema tiene default = true
  createdAt: Date;
  updatedAt: Date;
}
