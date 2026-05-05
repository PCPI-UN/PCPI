import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { CreateProjectDTO } from '../dto/create-project.dto';
import { NotFoundError, ValidationError } from '../../domain/errors';
import { EventServicePort } from '../ports/event-service.port';
import { EVENT_SERVICE_PORT } from '../ports/event-service.port';

@Injectable()
export class CreateProjectUC {
  constructor(
    @Inject('ProjectRepository') private readonly repo: ProjectRepository,
    @Inject(EVENT_SERVICE_PORT)
    private readonly eventService: EventServicePort
) {}

  async execute(input: CreateProjectDTO) {

    // 1. validar evento
    const event = await this.eventService.getEventById(input.eventId);
    if (!event) {
      throw new NotFoundError('El evento no existe en event-service');
    }
    if (event.active === false) {
      throw new ValidationError('El evento está inactivo');
    }

    // 2. si mandan courseId, validamos que exista y que pertenezca al evento
    if (input.courseId) {
      const course = await this.eventService.getCourseById(input.courseId);
      if (!course) {
        throw new NotFoundError('El curso no existe en event-service');
      }
      if (course.eventId !== input.eventId) {
        throw new ValidationError('El curso no pertenece a ese evento');
      }
    }

    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Project name is required');
    }

    if (!input.courseId || input.courseId <= 0) {
      throw new ValidationError('Invalid courseId');
    }
    // Asegura que no exista otro proyecto con el mismo nombre en el mismo evento y curso
    const existing = await this.repo.findProject(input.eventId, input.courseId, input.name.trim());
    if (existing) {
      throw new ValidationError('A project with the same name already exists for this event and course');
    }
  
    //3. Validar que la fecha límite de inscripción del evento no haya pasado
    const currentDate = new Date();
    const registrationDeadline = new Date(event.inscriptionDeadline);
    if (registrationDeadline < currentDate) {
      throw new ValidationError('The event registration deadline has passed');
    }
    
    //4. Verficar que el evento sea publicJoinable
    if (!event.isPubliclyJoinable) {
      throw new ValidationError('The event is not public joinable');
    }

    const state = input.state ?? 'UNDER_REVIEW';
    return this.repo.create({
      eventId: input.eventId,
      courseId: input.courseId,
      name: input.name.trim(),
      projectCode: input.projectCode,
      description: input.description,
      eventNumber: input.eventNumber,
      state,
    });
  }
}
