import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
    EVENT_SERVICE_NAME,
    EventServiceClient,
    EventProto,
} from '@app/common/generated/event';
import { EventServicePort } from '../ports/event.service.port';

@Injectable()
export class EventServiceAdapter implements EventServicePort, OnModuleInit {
    private eventService: EventServiceClient;

    constructor(
        @Inject(EVENT_SERVICE_NAME) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.eventService =
            this.client.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    }

    async getEvent(eventId: number): Promise<EventProto> {
        const response = await lastValueFrom(
            this.eventService.getEvent({ id: eventId })
        );

        if (!response.event) {
            throw new Error('Event not found');
        }

        return response.event;
    }

    async validateCoursesBelongToEvent(
        courseIds: number[],
        eventId: number,
    ): Promise<{ valid: boolean; invalidCourses: number[] }> {
        const response = await lastValueFrom(
            this.eventService.listCoursesByEvent({
                eventId,
                onlyActive: true,
                page: 1,
                limit: 100,
                q: '',
            })
        );

        const eventCourseIds = new Set(response.courses.map((c) => c.id));
        const invalidCourses = courseIds.filter((id) => !eventCourseIds.has(id));

        return {
            valid: invalidCourses.length === 0,
            invalidCourses,
        };
    }
}
