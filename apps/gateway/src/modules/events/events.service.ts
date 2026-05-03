import {
  BadRequestException,
  Injectable,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, Observable } from 'rxjs';
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
import { ListCoursesByEventDTO } from './dto/courses/list-courses-by-event.dto';
import { ListCoursesDTO } from './dto/courses/list-course.dto';
import { ListCoursesForDropdownDTO } from './dto/courses/list-courses-for-dropdown.dto';
import { UpdateCourseDTO } from './dto/courses/update-course.dto';
import { ProjectsService } from '../projects/projects.service';
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

type JurorUser = {
  id: number;
  firstName: string;
  lastName?: string | null;
  email: string;
};

type JurorAssignedProject = {
  id: number;
  evaluated: boolean;
};

type AuthServiceWithOptionalBulkUsers = AuthServiceClient & {
  getUsersByIds?: (request: {
    userIds: number[];
  }) => Observable<{ users?: JurorUser[] }>;
};
import {
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  Role,
} from '@app/common/generated/auth';
import {
  INVITATION_SERVICE_NAME,
  InvitationServiceClient,
  InvitationStatus,
} from '@app/common/generated/invitation';
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
  CreateCourseResponse,
  DeleteCourseResponse,
  CreateCategoryAwardRequest,
  CreateCategoryAwardResponse,
  GetCourseResponse,
  UpdateCategoryAwardRequest,
  UpdateCategoryAwardResponse,
  ListCoursesForDropdownResponse,
  ListCoursesResponse,
  GetCategoryAwardRequest,
  GetCategoryAwardResponse,
  ListCategoryAwardsRequest,
  ListCategoryAwardsResponse,
  DeleteCategoryAwardRequest,
  DeleteCategoryAwardResponse,
  UpdateCourseResponse,
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
  private eventService!: EventServiceClient;
  private authService!: AuthServiceClient;
  private invitationService!: InvitationServiceClient;
  private statusCache: EventStatusMapping[] | null = null;
  private rolesCache: any[] | null = null;

  constructor(
    @Inject(EVENT_SERVICE_NAME) private readonly eventClient: ClientGrpc,
    @Inject(AUTH_SERVICE_NAME) private readonly authClient: ClientGrpc,
    @Inject(INVITATION_SERVICE_NAME)
    private readonly invitationClient: ClientGrpc,
    private readonly configService: ConfigService,
    private readonly projectsService: ProjectsService,
  ) {}

  onModuleInit() {
    this.eventService =
      this.eventClient.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.authService =
      this.authClient.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
    this.invitationService =
      this.invitationClient.getService<InvitationServiceClient>(
        INVITATION_SERVICE_NAME,
      );
  }

  private mapCourseForFrontend(
    category: {
      id: number;
      eventId: number;
      name: string;
      description: string;
      active: boolean;
      createdAt: string;
    },
    event?: { id: number; name: string },
  ) {
    return {
      id: category.id,
      eventId: category.eventId,
      code: category.name,
      description: category.description || undefined,
      active: category.active,
      event,
      createdAt: category.createdAt
        ? Math.floor(new Date(category.createdAt).getTime() / 1000)
        : 0,
    };
  }

  private getNextPageToken(meta?: {
    currentPage?: number;
    totalPages?: number;
  }): string {
    const currentPage = meta?.currentPage ?? 1;
    const totalPages = meta?.totalPages ?? 1;

    return currentPage < totalPages ? String(currentPage + 1) : '';
  }

  private async getEventCatalogData(eventId: number) {
    const [categoriesResponse, detailsResponse] = await Promise.all([
      this.listCategoriesByEvent(eventId, {
        eventId,
        page: 1,
        limit: 1000,
      }),
      this.listEventInscriptionDetails({
        eventId,
        page: 1,
        limit: 1000,
      }),
    ]);

    const categories = categoriesResponse.categories ?? [];
    const awardsByCategory = await Promise.all(
      categories.map((category) =>
        this.listCategoryAwards({
          categoryId: category.id,
          page: 1,
          limit: 1000,
        }),
      ),
    );

    return {
      category: categories[0] ?? null,
      categories,
      awards: awardsByCategory.flatMap((item) => item.awards ?? []),
      specificInscriptionDetails: detailsResponse.details ?? [],
    };
  }

  private async enrichEventWithCatalogData<T extends { id: number }>(event: T) {
    const catalogData = await this.getEventCatalogData(event.id);
    return {
      ...event,
      ...catalogData,
    };
  }

  private async enrichEventsWithCatalogData<T extends { id: number }>(
    events: T[],
  ) {
    if (!events || events.length === 0) {
      return [];
    }

    return Promise.all(
      events.map((event) => this.enrichEventWithCatalogData(event)),
    );
  }

  private normalizeUpdateEventDTO(updateEventDTO: UpdateEventDTO): any {
    const payload = updateEventDTO as any;

    if (payload.event) {
      return {
        ...payload.event,
        id: payload.id ?? payload.event.id,
      };
    }

    return payload;
  }

  private async upsertEventCategories(
    eventId: number,
    categories?: Array<Partial<CreateCategoryDTO & UpdateCategoryDTO>>,
  ): Promise<number[]> {
    if (!categories) {
      return [];
    }

    const categoryIds: number[] = [];

    for (const category of categories) {
      if (category.id) {
        await this.updateCategory({
          id: category.id,
          name: category.name,
          description: category.description,
          active: category.active,
        });
        categoryIds.push(category.id);
        continue;
      }

      const response = await this.createCategory({
        eventId: category.eventId ?? eventId,
        name: category.name?.trim() || String(eventId),
        description: category.description,
        active: category.active ?? true,
      });

      if (response.category?.id) {
        categoryIds.push(response.category.id);
      }
    }

    return categoryIds;
  }

  private async getDefaultCategoryId(
    eventId: number,
    categoryIds: number[],
  ): Promise<number | undefined> {
    if (categoryIds.length > 0) {
      return categoryIds[0];
    }

    const response = await this.listCategoriesByEvent(eventId, {
      eventId,
      page: 1,
      limit: 1,
    });

    return response.categories?.[0]?.id;
  }

  private async upsertEventAwards(
    eventId: number,
    categoryIds: number[],
    awards?: Array<Partial<CreateCategoryAwardDTO & UpdateCategoryAwardDTO>>,
  ) {
    if (!awards) {
      return;
    }

    const defaultCategoryId = await this.getDefaultCategoryId(
      eventId,
      categoryIds,
    );

    await Promise.all(
      awards.map((award) => {
        if (award.id) {
          return this.updateCategoryAward({
            id: award.id,
            title: award.title,
            description: award.description,
            value: award.value,
            position: award.position,
          });
        }

        const categoryId = award.categoryId ?? defaultCategoryId;
        if (!categoryId) {
          throw new BadRequestException(
            'categoryId is required to create an award',
          );
        }

        return this.createCategoryAward({
          categoryId,
          title: award.title ?? '',
          description: award.description,
          value: award.value,
          position: award.position ?? 0,
        });
      }),
    );
  }

  private async upsertEventInscriptionDetails(
    eventId: number,
    details?: Array<
      Partial<CreateEventInscriptionDetailDTO & UpdateEventInscriptionDetailDTO>
    >,
  ) {
    if (!details) {
      return;
    }

    await Promise.all(
      details.map((detail) => {
        if (detail.id) {
          return this.updateEventInscriptionDetail({
            id: detail.id,
            title: detail.title,
            description: detail.description,
            value: detail.value,
            isRequired: detail.isRequired,
          });
        }

        return this.createEventInscriptionDetail({
          eventId: detail.eventId ?? eventId,
          title: detail.title ?? '',
          description: detail.description,
          value: detail.value ?? 0,
          isRequired: detail.isRequired ?? true,
        });
      }),
    );
  }

  private async updateEventCatalogData(
    eventId: number,
    categories?: Array<Partial<CreateCategoryDTO & UpdateCategoryDTO>>,
    awards?: Array<Partial<CreateCategoryAwardDTO & UpdateCategoryAwardDTO>>,
    details?: Array<
      Partial<CreateEventInscriptionDetailDTO & UpdateEventInscriptionDetailDTO>
    >,
  ) {
    const categoryIds = await this.upsertEventCategories(eventId, categories);

    await Promise.all([
      this.upsertEventAwards(eventId, categoryIds, awards),
      this.upsertEventInscriptionDetails(eventId, details),
    ]);
  }

  async create(createEventDTO: CreateEventDTO): Promise<CreateEventResponse> {
    const {
      category,
      awards,
      specificInscriptionDetails,
      eventInscriptionDetails,
      ...eventPayload
    } = createEventDTO as CreateEventDTO & {
      category?: CreateCategoryDTO;
      awards?: Omit<CreateCategoryAwardDTO, 'categoryId'>[];
      specificInscriptionDetails?: CreateEventInscriptionDetailDTO[];
      eventInscriptionDetails?: CreateEventInscriptionDetailDTO[];
    };
    const nestedInscriptionDetails =
      specificInscriptionDetails ?? eventInscriptionDetails;

    const response = await firstValueFrom(
      this.eventService.createEvent(eventPayload as CreateEventRequest),
    );

    if (response.event) {
      let createdCategoryId: number | undefined;
      try {
        const categoryResponse = await this.createCategory({
          eventId: response.event.id,
          name: category?.name?.trim() || String(response.event.id),
          description: category?.description,
          active: category?.active ?? true,
        });
        createdCategoryId = categoryResponse.category?.id;

        if (createdCategoryId && awards?.length) {
          await Promise.all(
            awards.map((award) =>
              this.createCategoryAward({
                ...award,
                categoryId: createdCategoryId!,
              }),
            ),
          );
        }
      } catch (error) {
        if (createdCategoryId) {
          try {
            await this.deleteCategory(createdCategoryId);
          } catch {}
        }
        await this.delete({ id: response.event.id });
        throw error;
      }
    }

    if (response.event && nestedInscriptionDetails?.length) {
      try {
        await Promise.all(
          nestedInscriptionDetails.map((detail) =>
            this.createEventInscriptionDetail({
              ...detail,
              eventId: response.event!.id,
            }),
          ),
        );
      } catch (error) {
        await this.delete({ id: response.event.id });
        throw error;
      }
    }

    if (response.event) {
      const statuses = await this.getAndCacheStatuses();
      const enrichedEvent = this.enrichSingleEventWithStatus(
        response.event,
        statuses,
      );
      return { event: enrichedEvent as EventProto };
    }

    return response;
  }

  async delete(deleteEventDTO: DeleteEventDTO): Promise<DeleteEventResponse> {
    return firstValueFrom(
      this.eventService.deleteEvent(deleteEventDTO as DeleteEventRequest),
    );
  }

  async get(getEventDTO: GetEventDTO): Promise<GetEventResponse> {
    const response = await firstValueFrom(
      this.eventService.getEvent(getEventDTO as GetEventRequest),
    );

    if (response.event) {
      const statuses = await this.getAndCacheStatuses();
      const enrichedEvent = this.enrichSingleEventWithStatus(
        response.event,
        statuses,
      );
      const enrichedEventWithCatalog =
        await this.enrichEventWithCatalogData(enrichedEvent);
      return { event: enrichedEventWithCatalog as any };
    }

    return response;
  }

  async update(updateEventDTO: UpdateEventDTO): Promise<UpdateEventResponse> {
    const normalizedDTO = this.normalizeUpdateEventDTO(updateEventDTO);
    const {
      categories,
      awards,
      specificInscriptionDetails,
      event,
      createdAt,
      updatedAt,
      status,
      statusName,
      statusDescription,
      createdByUserId,
      category,
      ...eventPayload
    } = normalizedDTO;

    const response = await firstValueFrom(
      this.eventService.updateEvent(eventPayload as UpdateEventRequest),
    );

    await this.updateEventCatalogData(
      eventPayload.id,
      categories,
      awards,
      specificInscriptionDetails,
    );

    if (response.event) {
      const statuses = await this.getAndCacheStatuses();
      const enrichedEvent = this.enrichSingleEventWithStatus(
        response.event,
        statuses,
      );
      const enrichedEventWithCatalog =
        await this.enrichEventWithCatalogData(enrichedEvent);
      return { event: enrichedEventWithCatalog as any };
    }

    return response;
  }

  async createMember(
    createEventMemberDTO: CreateEventMemberDTO,
  ): Promise<CreateEventMemberResponse> {
    return firstValueFrom(
      this.eventService.createEventMember(
        createEventMemberDTO as CreateEventMemberRequest,
      ),
    );
  }

  async deleteMember(
    deleteEventMemberDTO: DeleteEventMemberDTO,
  ): Promise<DeleteEventMemberResponse> {
    return firstValueFrom(
      this.eventService.deleteEventMember(
        deleteEventMemberDTO as DeleteEventMemberRequest,
      ),
    );
  }

  async listMembers(
    listEventMembersDTO: ListEventMembersDTO,
  ): Promise<ListEventMembersResponse> {
    return firstValueFrom(
      this.eventService.listEventMembers(
        listEventMembersDTO as ListEventMembersRequest,
      ),
    );
  }

  async listJurorsByEvent(eventId: number): Promise<{
    jurors: Array<{
      id: number;
      firstName: string;
      lastName: string | null;
      email: string;
      assignedProjects: JurorAssignedProject[];
    }>;
  }> {
    const [members, acceptedInvitationUserIds] = await Promise.all([
      this.fetchAllEventMembers(eventId),
      this.fetchAcceptedInvitationUserIds(eventId),
    ]);

    if (
      !members ||
      members.length === 0 ||
      acceptedInvitationUserIds.size === 0
    ) {
      return { jurors: [] };
    }

    const uniqueRoleIds = [...new Set(members.map((m) => m.roleId))];
    const jurorRoleIds = await this.resolveJurorRoleIds(uniqueRoleIds);

    const jurorMembers = members.filter(
      (member) =>
        member.active &&
        jurorRoleIds.has(member.roleId) &&
        acceptedInvitationUserIds.has(member.userId),
    );

    const userIds = [...new Set(jurorMembers.map((m) => m.userId))];
    const users = await this.fetchUsersByIds(userIds);
    const usersById = new Map(users.map((user) => [user.id, user]));

    const jurors = (
      await Promise.all(
        jurorMembers.map(async (member) => {
          const user = usersById.get(member.userId);
          if (!user) return null;

          const assignedProjects = await this.fetchAllAssignedProjectsByJuror(
            member.userId,
            eventId,
          );

          return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName ?? null,
            email: user.email,
            assignedProjects,
          };
        }),
      )
    ).filter(
      (
        juror,
      ): juror is {
        id: number;
        firstName: string;
        lastName: string | null;
        email: string;
        assignedProjects: JurorAssignedProject[];
      } => juror !== null,
    );

    return { jurors };
  }

  private async fetchAllAssignedProjectsByJuror(
    jurorUserId: number,
    eventId: number,
  ): Promise<JurorAssignedProject[]> {
    const pageSize = 20;
    let page = 1;
    let total = 0;
    const assignedProjects: JurorAssignedProject[] = [];

    do {
      const response = await this.projectsService.listAssignedProjectsByJuror(
        jurorUserId,
        eventId,
        page,
        pageSize,
      );

      total = response.total ?? 0;
      assignedProjects.push(
        ...(response.items ?? []).map((project) => ({
          id: project.id,
          evaluated: Boolean(project.evaluated),
        })),
      );

      page += 1;
    } while ((page - 1) * pageSize < total);

    return assignedProjects;
  }

  private async fetchAllEventMembers(eventId: number) {
    const pageSize = 20;
    let page = 1;
    let totalPages = 1;
    const members: NonNullable<ListEventMembersResponse['members']> = [];

    do {
      const response = await this.listMembers({
        eventId,
        page,
        limit: pageSize,
      });
      members.push(...(response.members ?? []));
      totalPages = response.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return members;
  }

  private async fetchAcceptedInvitationUserIds(eventId: number) {
    const pageSize = 20;
    let page = 1;
    let totalPages = 1;
    const accepted = new Set<number>();

    do {
      const invitationResponse = await firstValueFrom(
        this.invitationService.getEventInvitations({
          eventId,
          page,
          limit: pageSize,
        }),
      );

      for (const invitation of invitationResponse.invitations ?? []) {
        if (
          invitation.status === InvitationStatus.ACCEPTED &&
          invitation.invitedUserId > 0
        ) {
          accepted.add(invitation.invitedUserId);
        }
      }

      totalPages = invitationResponse.meta?.totalPages ?? 1;
      page += 1;
    } while (page <= totalPages);

    return accepted;
  }

  private async resolveJurorRoleIds(roleIds: number[]) {
    if (!roleIds || roleIds.length === 0) return new Set<number>();

    const rolesResponse = await firstValueFrom(
      this.authService.getRolesByIds({ roleIds }),
    );
    const jurorRoleIds = new Set<number>(
      (rolesResponse.roles ?? [])
        .filter(
          (role: Role) =>
            role.scope === 'EVENT' && role.name.toLowerCase() === 'juror',
        )
        .map((role: Role) => role.id),
    );

    return jurorRoleIds;
  }

  private async fetchUsersByIds(userIds: number[]): Promise<JurorUser[]> {
    if (!userIds || userIds.length === 0) return [];

    try {
      const auth = this.authService as AuthServiceWithOptionalBulkUsers;
      if (typeof auth.getUsersByIds === 'function') {
        const resp = await firstValueFrom(auth.getUsersByIds({ userIds }));
        return resp.users ?? [];
      }
    } catch (error) {
      console.warn(
        'Bulk users fetch failed, falling back to getUser by id',
        error,
      );
    }

    const users = await Promise.all(
      userIds.map(async (id) => {
        const response = await firstValueFrom(this.authService.getUser({ id }));
        return this.extractJurorUser(response);
      }),
    );

    return users.filter((user): user is JurorUser => user !== null);
  }

  private extractJurorUser(response: unknown): JurorUser | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const responseRecord = response as Record<string, unknown>;
    const candidate =
      responseRecord.user && typeof responseRecord.user === 'object'
        ? (responseRecord.user as Record<string, unknown>)
        : responseRecord;

    if (
      typeof candidate.id === 'number' &&
      typeof candidate.firstName === 'string' &&
      typeof candidate.email === 'string'
    ) {
      return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName:
          typeof candidate.lastName === 'string' || candidate.lastName === null
            ? candidate.lastName
            : null,
        email: candidate.email,
      };
    }

    return null;
  }

  async createCategory(
    dto: CreateCategoryDTO,
  ): Promise<CreateCategoryResponse> {
    return firstValueFrom(
      this.eventService.createCategory(dto as CreateCategoryRequest),
    );
  }

  async updateCategory(
    dto: UpdateCategoryDTO,
  ): Promise<UpdateCategoryResponse> {
    return firstValueFrom(
      this.eventService.updateCategory(dto as UpdateCategoryRequest),
    );
  }

  async getCategory(id: number): Promise<GetCategoryResponse> {
    return firstValueFrom(
      this.eventService.getCategory({ id } as GetCategoryRequest),
    );
  }

  async listCategories(
    dto: ListCategoriesDTO,
  ): Promise<ListCategoriesResponse> {
    return firstValueFrom(
      this.eventService.listCategories(dto as ListCategoriesRequest),
    );
  }

  async listCategoriesByEvent(
    eventId: number,
    dto: ListCategoriesDTO,
  ): Promise<ListCategoriesResponse> {
    return firstValueFrom(
      this.eventService.listCategoriesByEvent({
        ...dto,
        eventId,
      } as ListCategoriesByEventRequest),
    );
  }

  async deleteCategory(id: number): Promise<DeleteCategoryResponse> {
    return firstValueFrom(
      this.eventService.deleteCategory({ id } as DeleteCategoryRequest),
    );
  }

  async getDashboardStats() {
    return firstValueFrom(this.eventService.getDashboardStats({}));
  }

  async createCourse(dto: CreateCourseDTO): Promise<CreateCourseResponse> {
    await this.createCategory({
      eventId: dto.eventId,
      name: dto.code,
      description: dto.description,
      active: dto.active,
    });

    return {
      ok: true,
      message: 'Course created successfully',
    };
  }

  async updateCourse(dto: UpdateCourseDTO): Promise<UpdateCourseResponse> {
    await this.updateCategory({
      id: dto.id,
      name: dto.code,
      description: dto.description,
      active: dto.active,
    });

    return {
      ok: true,
      message: 'Course updated successfully',
    };
  }

  async getCourse(id: number): Promise<GetCourseResponse> {
    const response = await this.getCategory(id);
    const category = response.category;

    if (!category) {
      throw new Error(`Category ${id} was not returned by event-service`);
    }

    return {
      course: {
        id: category.id,
        eventId: category.eventId,
        code: category.name,
        description: category.description,
        active: category.active,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    };
  }

  async listCourses(dto: ListCoursesDTO): Promise<ListCoursesResponse> {
    const [response, eventResponse] = await Promise.all([
      this.listCategories({
        eventId: dto.eventId,
        onlyActive: dto.onlyActive,
        page: dto.page,
        limit: dto.limit,
        q: dto.q,
      }),
      dto.eventId
        ? this.get({ id: dto.eventId })
        : Promise.resolve({ event: undefined } as GetEventResponse),
    ]);

    const event = eventResponse.event
      ? {
          id: eventResponse.event.id,
          name: eventResponse.event.name,
        }
      : undefined;

    return {
      courses: response.categories.map((category) =>
        this.mapCourseForFrontend(category, event),
      ) as any,
      nextPageToken: this.getNextPageToken(response.meta),
    } as any;
  }

  async listCoursesByEvent(
    eventId: number,
    dto: ListCoursesByEventDTO,
  ): Promise<ListCoursesResponse> {
    const response = await this.listCourses({
      ...dto,
      eventId,
    });

    return response;
  }

  async listCoursesForDropdown(
    dto: ListCoursesForDropdownDTO,
  ): Promise<ListCoursesForDropdownResponse> {
    const eventId = dto.eventId as number;
    const response = await this.listCategoriesByEvent(eventId, {
      eventId,
      onlyActive: dto.onlyActive,
      page: 1,
      limit: 1000,
    });

    return {
      courses: response.categories.map((category) => ({
        id: category.id,
        code: category.name,
        description: category.description,
      })),
    };
  }

  async deleteCourse(id: number): Promise<DeleteCourseResponse> {
    await this.deleteCategory(id);
    return {
      ok: true,
    };
  }

  async createCategoryAward(
    dto: CreateCategoryAwardDTO,
  ): Promise<CreateCategoryAwardResponse> {
    return firstValueFrom(
      this.eventService.createCategoryAward(dto as CreateCategoryAwardRequest),
    );
  }

  async updateCategoryAward(
    dto: UpdateCategoryAwardDTO,
  ): Promise<UpdateCategoryAwardResponse> {
    return firstValueFrom(
      this.eventService.updateCategoryAward(dto as UpdateCategoryAwardRequest),
    );
  }

  async getCategoryAward(id: number): Promise<GetCategoryAwardResponse> {
    return firstValueFrom(
      this.eventService.getCategoryAward({ id } as GetCategoryAwardRequest),
    );
  }

  async listCategoryAwards(
    dto: ListCategoryAwardsDTO,
  ): Promise<ListCategoryAwardsResponse> {
    return firstValueFrom(
      this.eventService.listCategoryAwards(dto as ListCategoryAwardsRequest),
    );
  }

  async deleteCategoryAward(id: number): Promise<DeleteCategoryAwardResponse> {
    return firstValueFrom(
      this.eventService.deleteCategoryAward({
        id,
      } as DeleteCategoryAwardRequest),
    );
  }

  async createAwardWinner(
    dto: CreateAwardWinnerDTO,
  ): Promise<CreateAwardWinnerResponse> {
    return firstValueFrom(
      this.eventService.createAwardWinner(dto as CreateAwardWinnerRequest),
    );
  }

  async updateAwardWinner(
    dto: UpdateAwardWinnerDTO,
  ): Promise<UpdateAwardWinnerResponse> {
    return firstValueFrom(
      this.eventService.updateAwardWinner(dto as UpdateAwardWinnerRequest),
    );
  }

  async getAwardWinner(id: number): Promise<GetAwardWinnerResponse> {
    return firstValueFrom(
      this.eventService.getAwardWinner({ id } as GetAwardWinnerRequest),
    );
  }

  async listAwardWinners(
    dto: ListAwardWinnersDTO,
  ): Promise<ListAwardWinnersResponse> {
    return firstValueFrom(
      this.eventService.listAwardWinners(dto as ListAwardWinnersRequest),
    );
  }

  async deleteAwardWinner(id: number): Promise<DeleteAwardWinnerResponse> {
    return firstValueFrom(
      this.eventService.deleteAwardWinner({ id } as DeleteAwardWinnerRequest),
    );
  }

  async createEventInscriptionDetail(
    dto: CreateEventInscriptionDetailDTO,
  ): Promise<CreateEventInscriptionDetailResponse> {
    return firstValueFrom(
      this.eventService.createEventInscriptionDetail(
        dto as CreateEventInscriptionDetailRequest,
      ),
    );
  }

  async updateEventInscriptionDetail(
    dto: UpdateEventInscriptionDetailDTO,
  ): Promise<UpdateEventInscriptionDetailResponse> {
    return firstValueFrom(
      this.eventService.updateEventInscriptionDetail(
        dto as UpdateEventInscriptionDetailRequest,
      ),
    );
  }

  async getEventInscriptionDetail(
    id: number,
  ): Promise<GetEventInscriptionDetailResponse> {
    return firstValueFrom(
      this.eventService.getEventInscriptionDetail({
        id,
      } as GetEventInscriptionDetailRequest),
    );
  }

  async listEventInscriptionDetails(
    dto: ListEventInscriptionDetailsDTO,
  ): Promise<ListEventInscriptionDetailsResponse> {
    return firstValueFrom(
      this.eventService.listEventInscriptionDetails(
        dto as ListEventInscriptionDetailsRequest,
      ),
    );
  }

  async deleteEventInscriptionDetail(
    id: number,
  ): Promise<DeleteEventInscriptionDetailResponse> {
    return firstValueFrom(
      this.eventService.deleteEventInscriptionDetail({
        id,
      } as DeleteEventInscriptionDetailRequest),
    );
  }

  async createEventRecap(
    dto: CreateEventRecapDTO,
  ): Promise<CreateEventRecapResponse> {
    return firstValueFrom(
      this.eventService.createEventRecap(dto as CreateEventRecapRequest),
    );
  }

  async updateEventRecap(
    dto: UpdateEventRecapDTO,
  ): Promise<UpdateEventRecapResponse> {
    return firstValueFrom(
      this.eventService.updateEventRecap(dto as UpdateEventRecapRequest),
    );
  }

  async getEventRecap(id: number): Promise<GetEventRecapResponse> {
    return firstValueFrom(
      this.eventService.getEventRecap({ id } as GetEventRecapRequest),
    );
  }

  async listEventRecaps(
    dto: ListEventRecapsDTO,
  ): Promise<ListEventRecapsResponse> {
    return firstValueFrom(
      this.eventService.listEventRecaps(dto as ListEventRecapsRequest),
    );
  }

  async deleteEventRecap(id: number): Promise<DeleteEventRecapResponse> {
    return firstValueFrom(
      this.eventService.deleteEventRecap({ id } as DeleteEventRecapRequest),
    );
  }

  /**
   * Get event statuses from service and cache them
   * This is called internally to enrich events with human-readable status
   */
  async getEventStatuses(): Promise<GetEventStatusesResponse> {
    return firstValueFrom(
      this.eventService.getEventStatuses({} as GetEventStatusesRequest),
    );
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
      statusName: statuses.find((s) => s.value === status)?.name,
      statusDescription: statuses.find((s) => s.value === status)?.description,
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

    return events.map((event) =>
      this.enrichSingleEventWithStatus(event, statuses),
    );
  }

  /**
   * List events where the user is a member (with role information)
   * Enriches events with human-readable status names and role details
   */
  async listMyEvents(
    userId: number,
    dto: ListMyEventsDTO,
  ): Promise<ListMyEventsResponse> {
    const response = await firstValueFrom(
      this.eventService.listMyEvents({ userId, ...dto } as ListMyEventsRequest),
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
    const enrichedEvents = response.events.map((event) => {
      const { status, roleId, ...eventWithoutStatusAndRoleId } = event;
      const role = roles.find((r) => r.id === roleId);

      return {
        ...eventWithoutStatusAndRoleId,
        statusName: statuses.find((s) => s.value === status)?.name,
        statusDescription: statuses.find((s) => s.value === status)
          ?.description,
        role: role
          ? {
              id: role.id,
              name: role.name,
              scope: role.scope,
              description: role.description,
            }
          : null,
      };
    });

    const enrichedEventsWithCatalog =
      await this.enrichEventsWithCatalogData(enrichedEvents);

    return {
      ...response,
      events: enrichedEventsWithCatalog as any,
    };
  }

  /**
   * List all events (public or admin view)
   * Enriches events with human-readable status names
   */
  async listEvents(dto: ListEventsDTO): Promise<ListEventsResponse> {
    const response = await firstValueFrom(
      this.eventService.listEvents(dto as ListEventsRequest),
    );

    const statuses = await this.getAndCacheStatuses();
    const enrichedEvents = this.enrichEventsWithStatus(
      response.events,
      statuses,
    );
    const enrichedEventsWithCatalog =
      await this.enrichEventsWithCatalogData(enrichedEvents);

    return {
      ...response,
      events: enrichedEventsWithCatalog as any,
    };
  }

  async getMyProjectForEvent(userId: number, eventId: number) {
    const [projectResponse, eventResponse] = await Promise.all([
      this.projectsService.getMyProjectByEvent(userId, eventId),
      this.get({ id: eventId }),
    ]);

    const project = projectResponse.project
      ? {
          ...projectResponse.project,
          participants: (projectResponse.project.participants ?? []).map(
            ({ studentCode, semester, career, ...participant }) => ({
              ...participant,
              ParticipantCode: studentCode,
              semester,
              career,
            }),
          ),
        }
      : undefined;

    return {
      project,
      event: eventResponse.event,
    };
  }
}
