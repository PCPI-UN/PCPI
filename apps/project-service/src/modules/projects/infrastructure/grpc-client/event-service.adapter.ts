import { Injectable } from '@nestjs/common';
import { EventServicePort } from '../../application/ports/event-service.port';
import { EventGrpcClient } from './event.grpc-client';

@Injectable()
export class EventServiceAdapter implements EventServicePort {
  constructor(private readonly grpc: EventGrpcClient) {}

  async getEventById(id: number) {
    const res = await this.grpc.getEvent(id);
    return res ?? null;
  }

  async getCourseById(id: number) {
    const res = await this.grpc.getCourse(id);
    return res?.course ?? null;
  }
}
