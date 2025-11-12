import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreateEventDTO } from './dto/events/create-event.dto';
import { DeleteEventDTO } from './dto/events/delete-event.dto';
import { GetEventDTO } from './dto/events/get-event.dto';
import { ListEventsDTO } from './dto/events/list-events.dto';
import { UpdateEventDTO } from './dto/events/update-event.dto';
import { ListEventsPageDTO } from './dto/events/list-events-page.dto';
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
} from '@app/common/generated/event';
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  Role,
} from '@app/common/generated/auth';
import { CreateEventRequest,
    CreateEventResponse,
    DeleteEventRequest,
    DeleteEventResponse,
    GetEventRequest,
    GetEventResponse,
    ListEventsRequest,
    ListEventsResponse,
    UpdateEventRequest,
    UpdateEventResponse,
    ListEventsRequestPage,
    ListEventsResponsePage,
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
    ListCoursesByEventResponse
 } from '@app/common/generated/event';

@Injectable()
export class EventService implements OnModuleInit{
    private eventService: EventServiceClient;
    private authService: AuthServiceClient;

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
        return firstValueFrom(this.eventService.createEvent(createEventDTO as CreateEventRequest));
    }

    async delete(deleteEventDTO: DeleteEventDTO): Promise<DeleteEventResponse> {
        return firstValueFrom(this.eventService.deleteEvent(deleteEventDTO as DeleteEventRequest));
    }

    async get(getEventDTO: GetEventDTO): Promise<GetEventResponse> {
        return firstValueFrom(this.eventService.getEvent(getEventDTO as GetEventRequest));
    }

    async listPage(listEventsPageDTO: ListEventsPageDTO) {
        return firstValueFrom(this.eventService.listEvents(listEventsPageDTO as any));
    }

    async list(listEventsDTO: ListEventsDTO): Promise<ListEventsResponse> {
        return firstValueFrom(this.eventService.listEvents(listEventsDTO as ListEventsRequest));
    }

    async update(updateEventDTO: UpdateEventDTO): Promise<UpdateEventResponse> {
        return firstValueFrom(this.eventService.updateEvent(updateEventDTO as UpdateEventRequest));
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

    async listCourses(listCoursesDTO?: ListCoursesDTO): Promise<ListCoursesResponse> {
        // Assuming the gRPC method can handle optional DTO or empty for all
        return firstValueFrom(this.eventService.listCourses(listCoursesDTO as ListCoursesRequest || {}));
    }

    async listCoursesByEvent(listCoursesByEventDTO: ListCoursesByEventDTO): Promise<ListCoursesByEventResponse> {
        return firstValueFrom(this.eventService.listCoursesByEvent(listCoursesByEventDTO as ListCoursesByEventRequest));
    }

    async updateCourse(updateCourseDTO: UpdateCourseDTO): Promise<UpdateCourseResponse> {
        return firstValueFrom(this.eventService.updateCourse(updateCourseDTO as UpdateCourseRequest));
    }
}