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
import {
  CreateAwardWinnerDTO,
  CreateCategoryAwardDTO,
  CreateCategoryDTO,
  CreateEventInscriptionDetailDTO,
  CreateEventRecapDTO,
  ListAwardWinnersDTO,
  ListCategoriesDTO,
  ListCategoryAwardsDTO,
  ListEventInscriptionDetailsDTO,
  ListEventRecapsDTO,
  UpdateAwardWinnerDTO,
  UpdateCategoryAwardDTO,
  UpdateCategoryDTO,
  UpdateEventInscriptionDetailDTO,
  UpdateEventRecapDTO,
} from './dto/event-catalog.dto';
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
  ListMyEventsRequest,
  ListMyEventsResponse,
  ListEventsRequest,
  ListEventsResponse,
  GetEventStatusesRequest,
  GetEventStatusesResponse,
  EventStatusMapping,
  EventProto,
  EventWithRole,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  GetCategoryRequest,
  GetCategoryResponse,
  ListCategoriesRequest,
  ListCategoriesResponse,
  ListCategoriesByEventRequest,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  CreateCategoryAwardRequest,
  CreateCategoryAwardResponse,
  UpdateCategoryAwardRequest,
  UpdateCategoryAwardResponse,
  GetCategoryAwardRequest,
  GetCategoryAwardResponse,
  ListCategoryAwardsRequest,
  ListCategoryAwardsResponse,
  DeleteCategoryAwardRequest,
  DeleteCategoryAwardResponse,
  CreateAwardWinnerRequest,
  CreateAwardWinnerResponse,
  UpdateAwardWinnerRequest,
  UpdateAwardWinnerResponse,
  GetAwardWinnerRequest,
  GetAwardWinnerResponse,
  ListAwardWinnersRequest,
  ListAwardWinnersResponse,
  DeleteAwardWinnerRequest,
  DeleteAwardWinnerResponse,
  CreateEventInscriptionDetailRequest,
  CreateEventInscriptionDetailResponse,
  UpdateEventInscriptionDetailRequest,
  UpdateEventInscriptionDetailResponse,
  GetEventInscriptionDetailRequest,
  GetEventInscriptionDetailResponse,
  ListEventInscriptionDetailsRequest,
  ListEventInscriptionDetailsResponse,
  DeleteEventInscriptionDetailRequest,
  DeleteEventInscriptionDetailResponse,
  CreateEventRecapRequest,
  CreateEventRecapResponse,
  UpdateEventRecapRequest,
  UpdateEventRecapResponse,
  GetEventRecapRequest,
  GetEventRecapResponse,
  ListEventRecapsRequest,
  ListEventRecapsResponse,
  DeleteEventRecapRequest,
  DeleteEventRecapResponse,
} from '@app/common/generated/event';

@Injectable()
export class EventService implements OnModuleInit {
    private eventService: EventServiceClient;
    private authService: AuthServiceClient;
    private statusCache: EventStatusMapping[] | null = null;
    private rolesCache: any[] | null = null;

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

    async createCategory(dto: CreateCategoryDTO): Promise<CreateCategoryResponse> {
        return firstValueFrom(this.eventService.createCategory(dto as CreateCategoryRequest));
    }

    async updateCategory(dto: UpdateCategoryDTO): Promise<UpdateCategoryResponse> {
        return firstValueFrom(this.eventService.updateCategory(dto as UpdateCategoryRequest));
    }

    async getCategory(id: number): Promise<GetCategoryResponse> {
        return firstValueFrom(this.eventService.getCategory({ id } as GetCategoryRequest));
    }

    async listCategories(dto: ListCategoriesDTO): Promise<ListCategoriesResponse> {
        return firstValueFrom(this.eventService.listCategories(dto as ListCategoriesRequest));
    }

    async listCategoriesByEvent(eventId: number, dto: ListCategoriesDTO): Promise<ListCategoriesResponse> {
        return firstValueFrom(this.eventService.listCategoriesByEvent({ ...dto, eventId } as ListCategoriesByEventRequest));
    }

    async deleteCategory(id: number): Promise<DeleteCategoryResponse> {
        return firstValueFrom(this.eventService.deleteCategory({ id } as DeleteCategoryRequest));
    }

    async createCategoryAward(dto: CreateCategoryAwardDTO): Promise<CreateCategoryAwardResponse> {
        return firstValueFrom(this.eventService.createCategoryAward(dto as CreateCategoryAwardRequest));
    }

    async updateCategoryAward(dto: UpdateCategoryAwardDTO): Promise<UpdateCategoryAwardResponse> {
        return firstValueFrom(this.eventService.updateCategoryAward(dto as UpdateCategoryAwardRequest));
    }

    async getCategoryAward(id: number): Promise<GetCategoryAwardResponse> {
        return firstValueFrom(this.eventService.getCategoryAward({ id } as GetCategoryAwardRequest));
    }

    async listCategoryAwards(dto: ListCategoryAwardsDTO): Promise<ListCategoryAwardsResponse> {
        return firstValueFrom(this.eventService.listCategoryAwards(dto as ListCategoryAwardsRequest));
    }

    async deleteCategoryAward(id: number): Promise<DeleteCategoryAwardResponse> {
        return firstValueFrom(this.eventService.deleteCategoryAward({ id } as DeleteCategoryAwardRequest));
    }

    async createAwardWinner(dto: CreateAwardWinnerDTO): Promise<CreateAwardWinnerResponse> {
        return firstValueFrom(this.eventService.createAwardWinner(dto as CreateAwardWinnerRequest));
    }

    async updateAwardWinner(dto: UpdateAwardWinnerDTO): Promise<UpdateAwardWinnerResponse> {
        return firstValueFrom(this.eventService.updateAwardWinner(dto as UpdateAwardWinnerRequest));
    }

    async getAwardWinner(id: number): Promise<GetAwardWinnerResponse> {
        return firstValueFrom(this.eventService.getAwardWinner({ id } as GetAwardWinnerRequest));
    }

    async listAwardWinners(dto: ListAwardWinnersDTO): Promise<ListAwardWinnersResponse> {
        return firstValueFrom(this.eventService.listAwardWinners(dto as ListAwardWinnersRequest));
    }

    async deleteAwardWinner(id: number): Promise<DeleteAwardWinnerResponse> {
        return firstValueFrom(this.eventService.deleteAwardWinner({ id } as DeleteAwardWinnerRequest));
    }

    async createEventInscriptionDetail(dto: CreateEventInscriptionDetailDTO): Promise<CreateEventInscriptionDetailResponse> {
        return firstValueFrom(this.eventService.createEventInscriptionDetail(dto as CreateEventInscriptionDetailRequest));
    }

    async updateEventInscriptionDetail(dto: UpdateEventInscriptionDetailDTO): Promise<UpdateEventInscriptionDetailResponse> {
        return firstValueFrom(this.eventService.updateEventInscriptionDetail(dto as UpdateEventInscriptionDetailRequest));
    }

    async getEventInscriptionDetail(id: number): Promise<GetEventInscriptionDetailResponse> {
        return firstValueFrom(this.eventService.getEventInscriptionDetail({ id } as GetEventInscriptionDetailRequest));
    }

    async listEventInscriptionDetails(dto: ListEventInscriptionDetailsDTO): Promise<ListEventInscriptionDetailsResponse> {
        return firstValueFrom(this.eventService.listEventInscriptionDetails(dto as ListEventInscriptionDetailsRequest));
    }

    async deleteEventInscriptionDetail(id: number): Promise<DeleteEventInscriptionDetailResponse> {
        return firstValueFrom(this.eventService.deleteEventInscriptionDetail({ id } as DeleteEventInscriptionDetailRequest));
    }

    async createEventRecap(dto: CreateEventRecapDTO): Promise<CreateEventRecapResponse> {
        return firstValueFrom(this.eventService.createEventRecap(dto as CreateEventRecapRequest));
    }

    async updateEventRecap(dto: UpdateEventRecapDTO): Promise<UpdateEventRecapResponse> {
        return firstValueFrom(this.eventService.updateEventRecap(dto as UpdateEventRecapRequest));
    }

    async getEventRecap(id: number): Promise<GetEventRecapResponse> {
        return firstValueFrom(this.eventService.getEventRecap({ id } as GetEventRecapRequest));
    }

    async listEventRecaps(dto: ListEventRecapsDTO): Promise<ListEventRecapsResponse> {
        return firstValueFrom(this.eventService.listEventRecaps(dto as ListEventRecapsRequest));
    }

    async deleteEventRecap(id: number): Promise<DeleteEventRecapResponse> {
        return firstValueFrom(this.eventService.deleteEventRecap({ id } as DeleteEventRecapRequest));
    }

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
     * Get all roles from auth-service and cache them
     * TTL is managed at HTTP layer via Redis cache
     */
    private async getAndCacheRoles(): Promise<any[]> {
        if (!this.rolesCache) {
            const response = await firstValueFrom(this.authService.getRoles({}));
            this.rolesCache = response.roles;
        }
        return this.rolesCache;
    }

    /**
     * Enrich a single event with human-readable status names
     * Removes the numeric status field from response
     */
    private enrichSingleEventWithStatus<T extends EventProto | EventWithRole>(
        event: T,
        statuses: EventStatusMapping[],
    ): T & { statusName?: string; statusDescription?: string } {
        const { status, ...eventWithoutStatus } = event;
        return {
            ...eventWithoutStatus,
            statusName: statuses.find(s => s.value === status)?.name,
            statusDescription: statuses.find(s => s.value === status)?.description,
        } as T & { statusName?: string; statusDescription?: string };
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
     * Enriches events with human-readable status names and role details
     */
    async listMyEvents(userId: number, dto: ListMyEventsDTO): Promise<ListMyEventsResponse> {
        const response = await firstValueFrom(
            this.eventService.listMyEvents({ userId, ...dto } as ListMyEventsRequest)
        );

        if (!response.events || response.events.length === 0) {
            return {
                ...response,
                events: [],
            };
        }

        // Get cached statuses and roles
        const [statuses, roles] = await Promise.all([
            this.getAndCacheStatuses(),
            this.getAndCacheRoles(),
        ]);

        // Enrich events with status and role information
        const enrichedEvents = response.events.map(event => {
            const { status, roleId, ...eventWithoutStatusAndRoleId } = event;
            const role = roles.find(r => r.id === roleId);

            return {
                ...eventWithoutStatusAndRoleId,
                statusName: statuses.find(s => s.value === status)?.name,
                statusDescription: statuses.find(s => s.value === status)?.description,
                role: role ? {
                    id: role.id,
                    name: role.name,
                    scope: role.scope,
                    description: role.description,
                } : null,
            };
        });

        return {
            ...response,
            events: enrichedEvents as any,
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
