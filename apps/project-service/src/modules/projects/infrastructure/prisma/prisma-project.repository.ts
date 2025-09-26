import { Injectable } from '@nestjs/common';
//apps\project-service\src\common\prisma\prisma.service.ts
// Update the path below to the correct relative path where prisma.service.ts actually exists.
// For example, if it's in 'src/common/prisma/prisma.service', use:
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ProjectRepository } from '../../application/ports/project.repository';
import { Project } from '../../domain/entities/project.entity';
import { ProjectDocument } from '../../domain/entities/project.entity';


type CreateProjectInput = {
  eventId: number;
  name: string;
  description?: string;
  eventNumber?: string;
};

type ListOpts = { q?: string; page?: number; pageSize?: number };

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectInput): Promise<Project> {
    return this.prisma.project.create({
      data: {
        eventId: data.eventId,
        name: data.name,
        description: data.description ?? null,
        eventNumber: data.eventNumber ?? null,
      },
    }) as unknown as Project;
  }

  async findById(id: number): Promise<Project | null> {
    return (await this.prisma.project.findUnique({ where: { id } })) as unknown as Project | null;
  }

  async listByEvent(eventId: number, opts?: ListOpts): Promise<{ items: Project[]; total: number }> {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const pageSize = opts?.pageSize && opts.pageSize > 0 ? opts.pageSize : 20;

    const where: any = {
      eventId,
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
}
