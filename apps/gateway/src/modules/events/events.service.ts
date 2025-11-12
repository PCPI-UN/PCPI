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

    async create(createEventDTO: CreateEventDTO) {
        return firstValueFrom(this.eventService.createEvent(createEventDTO as any));
    }

    async delete(deleteEventDTO: DeleteEventDTO) {
        return firstValueFrom(this.eventService.deleteEvent(deleteEventDTO));
    }

    async get(getEventDTO: GetEventDTO) {
        return firstValueFrom(this.eventService.getEvent(getEventDTO));
    }

    async listPage(listEventsPageDTO: ListEventsPageDTO) {
        return firstValueFrom(this.eventService.listEvents(listEventsPageDTO as any));
    }

    async list(listEventsDTO: ListEventsDTO) {
        return firstValueFrom(this.eventService.listEvents(listEventsDTO as any));
    }

    async update(updateEventDTO: UpdateEventDTO) {
        return firstValueFrom(this.eventService.updateEvent(updateEventDTO as any));
    }

    async createMember(createEventMemberDTO: CreateEventMemberDTO) {
        return firstValueFrom(this.eventService.createEventMember(createEventMemberDTO));
    }

    async deleteMember(deleteEventMemberDTO: DeleteEventMemberDTO) {
        return firstValueFrom(this.eventService.deleteEventMember(deleteEventMemberDTO));
    }

    async listMembers(listEventMembersDTO: ListEventMembersDTO) {
        return firstValueFrom(this.eventService.listEventMembers(listEventMembersDTO));
    }

    async createCourse(createCourseDTO: CreateCourseDTO) {
        return firstValueFrom(this.eventService.createCourse(createCourseDTO as any));
    }

    async deleteCourse(deleteCourseDTO: DeleteCourseDTO) {
        return firstValueFrom(this.eventService.deleteCourse(deleteCourseDTO));
    }

    async getCourse(getCourseDTO: GetCourseDTO) {
        return firstValueFrom(this.eventService.getCourse(getCourseDTO));
    }

    async listCourses(listCoursesDTO?: ListCoursesDTO) {
        // Assuming the gRPC method can handle optional DTO or empty for all
        return firstValueFrom(this.eventService.listCourses(listCoursesDTO as any || {}));
    }

    async listCoursesByEvent(listCoursesByEventDTO: ListCoursesByEventDTO) {
        return firstValueFrom(this.eventService.listCoursesByEvent(listCoursesByEventDTO as any));
    }

    async updateCourse(updateCourseDTO: UpdateCourseDTO) {
        return firstValueFrom(this.eventService.updateCourse(updateCourseDTO as any));
    }
}