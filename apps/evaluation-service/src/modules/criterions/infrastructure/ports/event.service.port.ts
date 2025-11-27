import { EventProto } from '@app/common/generated/event';

export abstract class EventServicePort {
    abstract getEvent(eventId: number): Promise<EventProto>;
    abstract validateCoursesBelongToEvent(
        courseIds: number[],
        eventId: number
    ): Promise<{ valid: boolean; invalidCourses: number[] }>;
}
