export abstract class EventRepository {
  abstract create(data: any): Promise<any>;
  abstract findById(id: number): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract update(id: number, data: any): Promise<any>;
  abstract delete(id: number): Promise<void>;
}
