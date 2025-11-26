import type {
  EventProto,
  CreateEventMemberResponse,
} from '@app/common/generated/event';

export abstract class EventServicePort {
  /**
   * Retrieves event details by event ID.
   *
   * @param eventId - The ID of the event
   * @returns Event details or null if not found
   */
  abstract getEvent(eventId: number): Promise<EventProto | null>;

  /**
   * Creates an event member (assigns user to event with role).
   *
   * @param params - Event member creation parameters
   * @returns Success status and message
   */
  abstract createEventMember(params: {
    eventId: number;
    userId: number;
    roleId: number;
  }): Promise<CreateEventMemberResponse>;
}
