export const toProtoProject = (p: any) => ({
  id: p.id,
  eventId: p.eventId ?? p.event_id,
  name: p.name,
  description: p.description ?? undefined,
  eventNumber: p.eventNumber ?? p.event_number ?? undefined,
  createdAt: p.createdAt?.toISOString?.() ?? p.created_at,
  updatedAt: p.updatedAt?.toISOString?.() ?? p.updated_at,
});

export const toProtoDocument = (d: any) => ({
  id: d.id,
  projectId: d.projectId ?? d.project_id,
  url: d.url,
  createdAt: d.createdAt?.toISOString?.() ?? d.created_at,
  updatedAt: d.updatedAt?.toISOString?.() ?? d.updated_at,
});
