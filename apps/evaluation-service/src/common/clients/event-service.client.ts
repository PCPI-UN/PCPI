import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  EventServiceClient as EventServiceGrpc,
  EVENT_SERVICE_NAME,
  GetEventRequest,
  GetEventResponse,
  GetCourseRequest,
  GetCourseResponse,
  ListCoursesByEventRequest,
  ListCoursesResponse,
  Course,
} from '@app/common/generated/event';

@Injectable()
export class EventServiceClient implements OnModuleInit {
  private eventService: EventServiceGrpc;

  constructor(@Inject(EVENT_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.eventService =
      this.client.getService<EventServiceGrpc>(EVENT_SERVICE_NAME);
  }

  /**
   * Get event details by ID
   * @throws RpcException if event not found
   */
  async getEvent(eventId: number): Promise<GetEventResponse> {
    const request: GetEventRequest = { id: eventId };
    const response = await firstValueFrom(this.eventService.getEvent(request));
    return response;
  }

  /**
   * Get course details by ID
   * @throws RpcException if course not found
   */
  async getCourse(courseId: number): Promise<Course|undefined> {
    const request: GetCourseRequest = { id: courseId };
    const response = await firstValueFrom(
      this.eventService.getCourse(request),
    );
    return response.course;
  }

  /**
   * List all courses for a specific event
   * @param eventId - Event ID to filter courses
   * @param onlyActive - Optional filter for active courses only
   * @returns Array of courses belonging to the event
   */
  async listCoursesByEvent(
    eventId: number,
    onlyActive?: boolean,
  ): Promise<Course[]> {
    const request: ListCoursesByEventRequest = {
      eventId,
      onlyActive: onlyActive ?? false,
      page: 1,
      pageSize: 100,
      q: '',
    };
    const response = await firstValueFrom(
      this.eventService.listCoursesByEvent(request),
    );
    return response.courses;
  }

  /**
   * Validate that courses belong to a specific event
   * @param courseIds - Array of course IDs to validate
   * @param eventId - Expected event ID
   * @returns Object with validation result and invalid course IDs
   */
  async validateCoursesBelongToEvent(
    courseIds: number[],
    eventId: number,
  ): Promise<{ valid: boolean; invalidCourses: number[] }> {
    const eventCourses = await this.listCoursesByEvent(eventId, true);
    const eventCourseIds = new Set(eventCourses.map((c) => c.id));

    const invalidCourses = courseIds.filter((id) => !eventCourseIds.has(id));

    return {
      valid: invalidCourses.length === 0,
      invalidCourses,
    };
  }
}
