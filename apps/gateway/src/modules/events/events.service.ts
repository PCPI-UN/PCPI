import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateEventDTO } from './dto/events/create-event.dto';
import { DeleteEventDTO } from './dto/events/delete-event.dto';
import { GetEventDTO } from './dto/events/get-event.dto';
import { ListEventsDTO } from './dto/events/list-events.dto';
import { ListMyEventsDTO } from './dto/events/list-my-events.dto';
import { UpdateEventDTO } from './dto/events/update-event.dto';
import { CreateEventMemberDTO } from './dto/event-members/create-event-member.dto';
import { DeleteEventMemberDTO } from './dto/event-members/delete-event-member.dto';
import { ListEventMembersDTO } from './dto/event-members/list-event-members.dto';
import { CreateCourseDTO } from './dto/courses/create-course.dto';
import { DeleteCourseDTO } from './dto/courses/delete-course.dto';
import { UpdateCourseDTO } from './dto/courses/update-course.dto';
import { ListCoursesDTO } from './dto/courses/list-course.dto';
import { GetCourseDTO } from './dto/courses/get-course.dto';
import { ListCoursesByEventDTO } from './dto/courses/list-courses-by-event.dto';
import {
  EVENT_SERVICE_NAME,
  EventServiceClient,
  EventStatus,
} from '@app/common/generated/event';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
} from '@app/common/generated/auth';
import {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventRequest,
  DeleteEventResponse,
  GetEventRequest,
  GetEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  CreateEventMemberRequest,
  CreateEventMemberResponse,
  DeleteEventMemberRequest,
  DeleteEventMemberResponse,
  ListEventMembersRequest,
  ListEventMembersResponse,
  CreateCourseRequest,
  CreateCourseResponse,
  DeleteCourseRequest,
  DeleteCourseResponse,
  UpdateCourseRequest,
  UpdateCourseResponse,
  ListCoursesRequest,
  ListCoursesResponse,
  GetCourseRequest,
  GetCourseResponse,
  ListCoursesByEventRequest,
  ListCoursesByEventResponse,
  ListMyEventsRequest,
  ListMyEventsResponse,
  ListEventsRequest,
  ListEventsResponse,
  GetEventStatusesRequest,
  GetEventStatusesResponse,
  EventStatusMapping,
  EventProto,
  EventWithRole,
} from '@app/common/generated/event';

@Injectable()
export class EventService implements OnModuleInit {
    private eventService: EventServiceClient;
    private authService: AuthServiceClient;
    private statusCache: EventStatusMapping[] | null = null;

    constructor(
        @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
        @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
        private readonly configService: ConfigService,
    ) {}

    onModuleInit() {
       this.eventService = this.eventClient.getService<EventServiceClient>(
         EVENT_SERVICE_NAME,
       );
       this.authService = this.authClient.getService<AuthServiceClient>(
         AUTH_SERVICE_NAME,
       );
    }

    async create(createEventDTO: CreateEventDTO): Promise<CreateEventResponse> {
        const response = await firstValueFrom(this.eventService.createEvent(createEventDTO as CreateEventRequest));

        if (response.event) {
            const statuses = await this.getAndCacheStatuses();
            const enrichedEvent = this.enrichSingleEventWithStatus(response.event, statuses);
            return { event: enrichedEvent as EventProto };
        }

        return response;
    }

    async delete(deleteEventDTO: DeleteEventDTO): Promise<DeleteEventResponse> {
        return firstValueFrom(this.eventService.deleteEvent(deleteEventDTO as DeleteEventRequest));
    }

    async get(getEventDTO: GetEventDTO): Promise<GetEventResponse> {
        const response = await firstValueFrom(this.eventService.getEvent(getEventDTO as GetEventRequest));

        if (response.event) {
            const statuses = await this.getAndCacheStatuses();
            const enrichedEvent = this.enrichSingleEventWithStatus(response.event, statuses);
            return { event: enrichedEvent as EventProto };
        }

        return response;
    }

    async update(updateEventDTO: UpdateEventDTO): Promise<UpdateEventResponse> {
        const response = await firstValueFrom(this.eventService.updateEvent(updateEventDTO as UpdateEventRequest));

        if (response.event) {
            const statuses = await this.getAndCacheStatuses();
            const enrichedEvent = this.enrichSingleEventWithStatus(response.event, statuses);
            return { event: enrichedEvent as EventProto };
        }

        return response;
    }

    async createMember(createEventMemberDTO: CreateEventMemberDTO): Promise<CreateEventMemberResponse> {
        return firstValueFrom(this.eventService.createEventMember(createEventMemberDTO as CreateEventMemberRequest));
    }

    async deleteMember(deleteEventMemberDTO: DeleteEventMemberDTO): Promise<DeleteEventMemberResponse> {
        return firstValueFrom(this.eventService.deleteEventMember(deleteEventMemberDTO as DeleteEventMemberRequest));
    }

    async listMembers(listEventMembersDTO: ListEventMembersDTO): Promise<ListEventMembersResponse> {
        return firstValueFrom(this.eventService.listEventMembers(listEventMembersDTO as ListEventMembersRequest));
    }

    async createCourse(createCourseDTO: CreateCourseDTO): Promise<CreateCourseResponse> {
        return firstValueFrom(this.eventService.createCourse(createCourseDTO as CreateCourseRequest));
    }

    async deleteCourse(deleteCourseDTO: DeleteCourseDTO): Promise<DeleteCourseResponse> {
        return firstValueFrom(this.eventService.deleteCourse(deleteCourseDTO as DeleteCourseRequest));
    }

    async getCourse(getCourseDTO: GetCourseDTO): Promise<GetCourseResponse> {
        return firstValueFrom(this.eventService.getCourse(getCourseDTO as GetCourseRequest));
    }

    async findAllCourses(request: ListCoursesDTO): Promise<ListCoursesResponse> {
        return firstValueFrom(this.eventService.listCourses(request as ListCoursesRequest));
    }

    async listCoursesByEvent(listCoursesByEventDTO: ListCoursesByEventDTO): Promise<ListCoursesByEventResponse> {
        return firstValueFrom(this.eventService.listCoursesByEvent(listCoursesByEventDTO as ListCoursesByEventRequest));
    }

    async updateCourse(updateCourseDTO: UpdateCourseDTO): Promise<UpdateCourseResponse> {
        return firstValueFrom(this.eventService.updateCourse(updateCourseDTO as UpdateCourseRequest));
    }

    // =====================
    // NEW METHODS FOR EVENT LISTING
    // =====================

    /**
     * Get event statuses from service and cache them
     * This is called internally to enrich events with human-readable status
     */
    async getEventStatuses(): Promise<GetEventStatusesResponse> {
        return firstValueFrom(this.eventService.getEventStatuses({} as GetEventStatusesRequest));
    }

    /**
     * Get and cache event statuses (in-memory cache)
     * TTL is managed at HTTP layer via Redis cache
     */
    private async getAndCacheStatuses(): Promise<EventStatusMapping[]> {
        if (!this.statusCache) {
            const response = await this.getEventStatuses();
            this.statusCache = response.statuses;
        }
        return this.statusCache;
    }

    /**
     * Enrich a single event with human-readable status names
     */
    private enrichSingleEventWithStatus<T extends EventProto | EventWithRole>(
        event: T,
        statuses: EventStatusMapping[],
    ): T & { statusName?: string; statusDescription?: string } {
        return {
            ...event,
            statusName: statuses.find(s => s.value === event.status)?.name,
            statusDescription: statuses.find(s => s.value === event.status)?.description,
        };
    }

    /**
     * Enrich events array with human-readable status names
     */
    private enrichEventsWithStatus<T extends EventProto | EventWithRole>(
        events: T[],
        statuses: EventStatusMapping[],
    ): Array<T & { statusName?: string; statusDescription?: string }> {
        // Handle empty or undefined arrays
        if (!events || events.length === 0) {
            return [];
        }

        return events.map(event => this.enrichSingleEventWithStatus(event, statuses));
    }

    /**
     * List events where the user is a member (with role information)
     * Enriches events with human-readable status names
     */
    async listMyEvents(userId: number, dto: ListMyEventsDTO): Promise<ListMyEventsResponse> {
        const response = await firstValueFrom(
            this.eventService.listMyEvents({ userId, ...dto } as ListMyEventsRequest)
        );

        const statuses = await this.getAndCacheStatuses();
        const enrichedEvents = this.enrichEventsWithStatus(response.events, statuses);

        return {
            ...response,
            events: enrichedEvents as EventWithRole[],
        };
    }

    /**
     * List all events (public or admin view)
     * Enriches events with human-readable status names
     */
    async listEvents(dto: ListEventsDTO): Promise<ListEventsResponse> {
        const response = await firstValueFrom(
            this.eventService.listEvents(dto as ListEventsRequest)
        );

        const statuses = await this.getAndCacheStatuses();
        const enrichedEvents = this.enrichEventsWithStatus(response.events, statuses);

        return {
            ...response,
            events: enrichedEvents as EventProto[],
        };
    }
}