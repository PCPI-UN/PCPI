import { EventProto } from '@app/common/generated/event';

export abstract class EventServicePort {
    abstract getEvent(id: number): Promise<EventProto>;
}
