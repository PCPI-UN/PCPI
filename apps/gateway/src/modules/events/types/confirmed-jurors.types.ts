export type JurorUser = {
  id: number;
  firstName: string;
  lastName?: string | null;
  email: string;
};

export type JurorAssignedProject = {
  id: number;
  evaluated: boolean;
};

export type ConfirmedJuror = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  assignedProjects: JurorAssignedProject[];
};

export type ListConfirmedJurorsByEventResponse = {
  jurors: ConfirmedJuror[];
};
