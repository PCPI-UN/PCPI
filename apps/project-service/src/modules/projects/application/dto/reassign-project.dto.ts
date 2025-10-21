import { JurorKey } from '../../domain/entities/project.entity';

export interface ReassignProjectDTO {
  projectId: number;
  fromJuror: JurorKey;
  toJuror: JurorKey;
}
