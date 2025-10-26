import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { EventRepository } from '../../domain/repositories/event.repository';

@Injectable()
export class PrismaEventRepository extends EventRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  async findById(id: number) {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.event.findMany();
  }

  async update(id: number, data: any) {
    return this.prisma.event.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.prisma.event.delete({ where: { id } });
  }
}
