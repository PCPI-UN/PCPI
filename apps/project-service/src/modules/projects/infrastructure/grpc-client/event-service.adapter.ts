import { Injectable } from '@nestjs/common';
import { EventServicePort, JurorMembership } from '../../application/ports/event-service.port';
import { EventGrpcClient } from './event.grpc-client';

@Injectable()
export class EventServiceAdapter implements EventServicePort {
  constructor(private readonly grpc: EventGrpcClient) {}

  async getEventById(id: number) {
    const res = await this.grpc.getEvent(id); //res.event
    return res.event ?? null;
  }

  async getCourseById(id: number) {
    const res = await this.grpc.getCourse(id);
    return res?.course ?? null;
  }

  async getJurorMembership(userId: number, eventId: number): Promise<JurorMembership | null> {
    const res = await this.grpc.getJurorMembership(userId, eventId);
    
    // If the response indicates the user is not a juror, return null
    if (!res || !res.isJuror) {
      return null;
    }

    // Return the juror membership information
    return {
      memberUserId: res.memberUserId,
      memberEventId: res.memberEventId,
      memberRoleId: res.memberRoleId,
    };
  }
}
