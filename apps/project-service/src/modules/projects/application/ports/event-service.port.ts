export const EVENT_SERVICE_PORT = 'EVENT_SERVICE_PORT';

export interface EventServicePort {
  getEventById(id: number): Promise<any>;
  getCourseById(id: number): Promise<any>;
}
