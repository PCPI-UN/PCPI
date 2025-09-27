import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectDocument, ProjectState, JurorKey, ProjectParticipant } from '../../domain/entities/project.entity';


type CreateProjectInput = {
  eventId: number;
  courseId: number;
  name: string;
  description?: string;
  eventNumber?: string;
  state: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
};

type ListOpts = { courseId?: number; q?: string; page?: number; pageSize?: number };

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectInput): Promise<Project> {
    return this.prisma.project.create({
      data: {
        eventId: data.eventId,
        courseId: data.courseId,
        name: data.name,
        description: data.description ?? null,
        eventNumber: data.eventNumber ?? null,
        state: data.state, 
      },
    }) as unknown as Project;
  }

  async findById(id: number): Promise<Project | null> {
    return (await this.prisma.project.findUnique({ where: { id } })) as unknown as Project | null;
  }

  async findManyByIds(ids: number[]): Promise<Project[]> {
    if (!ids.length) return [];
    return (await this.prisma.project.findMany({ where: { id: { in: ids } } })) as unknown as Project[];
  }

  async listByEvent(eventId: number, opts?: ListOpts): Promise<{ items: Project[]; total: number }> {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 20;

    const where: any = {
      eventId,
      ...(opts?.courseId ? { courseId: opts.courseId } : {}),
      ...(opts?.q ? { name: { contains: opts.q, mode: 'insensitive' as const } } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' }, // camelCase
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items: items as unknown as Project[], total };
  }

  async updateProject(input: {
    id: number;
    name?: string;
    description?: string | null;
    eventNumber?: string | null;
    courseId?: number;
    state?: ProjectState;
  }): Promise<Project> {
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.eventNumber !== undefined) data.eventNumber = input.eventNumber;
    if (input.courseId !== undefined) data.courseId = input.courseId;
    if (input.state !== undefined) data.state = input.state;

    return (await this.prisma.project.update({
      where: { id: input.id },
      data,
    })) as unknown as Project;
  }

  async setProjectState(id: number, state: ProjectState): Promise<Project> {
    return (await this.prisma.project.update({
      where: { id },
      data: { state },
    })) as unknown as Project;
  }

  async delete(id: number): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  async addDocument(projectId: number, url: string): Promise<ProjectDocument> {
    return this.prisma.projectDocument.create({
      data: { projectId, url }, // camelCase
    }) as unknown as ProjectDocument;
  }

  async listDocuments(projectId: number): Promise<ProjectDocument[]> {
    return (await this.prisma.projectDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })) as unknown as ProjectDocument[];
  }

  async upsertAssignment(projectId: number, juror: JurorKey): Promise<void> {
    await this.prisma.projectAssignment.upsert({
      where: {
        projectId_memberUserId_memberEventId_memberRoleId: {
          projectId,
          memberUserId: juror.memberUserId,
          memberEventId: juror.memberEventId,
          memberRoleId: juror.memberRoleId,
        },
      },
      update: { updatedAt: new Date() },
      create: {
        projectId,
        memberUserId: juror.memberUserId,
        memberEventId: juror.memberEventId,
        memberRoleId: juror.memberRoleId,
      },
    });
  }

  async removeAssignment(projectId: number, juror: JurorKey): Promise<boolean> {
    const res = await this.prisma.projectAssignment.deleteMany({
      where: {
        projectId,
        memberUserId: juror.memberUserId,
        memberEventId: juror.memberEventId,
        memberRoleId: juror.memberRoleId,
      },
    });
    return res.count > 0;
  }

  async listAssignments(projectId: number): Promise<JurorKey[]> {
    const rows = await this.prisma.projectAssignment.findMany({
      where: { projectId },
      select: { memberUserId: true, memberEventId: true, memberRoleId: true },
      orderBy: [{ memberUserId: 'asc' }, { memberRoleId: 'asc' }],
    });
    return rows.map(r => ({
      memberUserId: r.memberUserId,
      memberEventId: r.memberEventId,
      memberRoleId: r.memberRoleId,
    }));
  }

  async addParticipant(input: { projectId: number; userId: number; studentCode?: number | null }): Promise<ProjectParticipant> {
  // Idempotente: si ya existe (PK compuesta), actualiza solo studentCode cuando venga
  return (await this.prisma.projectParticipant.upsert({
    where: {
      userId_projectId: { userId: input.userId, projectId: input.projectId }, // Prisma crea este where único por la PK compuesta
    },
    update: {
      ...(input.studentCode !== undefined ? { studentCode: input.studentCode } : {}),
    },
    create: {
      userId: input.userId,
      projectId: input.projectId,
      studentCode: input.studentCode ?? null,
    },
  })) as unknown as ProjectParticipant;
}

async listParticipants(projectId: number): Promise<ProjectParticipant[]> {
  return (await this.prisma.projectParticipant.findMany({
    where: { projectId },
    orderBy: { userId: 'asc' },
    select: { userId: true, projectId: true, studentCode: true },
  })) as unknown as ProjectParticipant[];
}

}
