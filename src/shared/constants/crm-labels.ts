import type {
  ActivityPriority,
  ActivityStatus,
  ActivityType,
  ClientStatus,
  ClientType,
  OpportunitySource,
  OpportunityStage,
  OpportunityStatus,
  ServiceType,
} from "@/generated/prisma/enums";

export const clientTypeLabels: Record<ClientType, string> = {
  persona_natural: "Persona natural",
  empresa: "Empresa",
  condominio: "Condominio",
  otro: "Otro",
};

export const clientStatusLabels: Record<ClientStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  bloqueado: "Bloqueado",
};

export const opportunitySourceLabels: Record<OpportunitySource, string> = {
  whatsapp: "WhatsApp",
  telefono: "Teléfono",
  instagram: "Instagram",
  google: "Google",
  referido: "Referido",
  postventa: "Postventa",
  otro: "Otro",
};

export const serviceTypeLabels: Record<ServiceType, string> = {
  revestimiento: "Revestimiento",
  reparacion: "Reparación",
  mantencion: "Mantención",
  otro: "Otro",
};

export const opportunityStageLabels: Record<OpportunityStage, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  visita_agendada: "Visita agendada",
  cotizado: "Cotizado",
  negociacion: "Negociación",
  ganado: "Ganado",
  perdido: "Perdido",
};

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  abierta: "Abierta",
  ganada: "Ganada",
  perdida: "Perdida",
  cancelada: "Cancelada",
};

export const activityTypeLabels: Record<ActivityType, string> = {
  llamada: "Llamada",
  whatsapp: "WhatsApp",
  visita_tecnica: "Visita técnica",
  seguimiento: "Seguimiento",
  coordinacion: "Coordinación",
  cobranza: "Cobranza",
  incidencia: "Incidencia",
  cambio_alcance: "Cambio de alcance",
  otro: "Otro",
};

export const activityStatusLabels: Record<ActivityStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completada: "Completada",
  cancelada: "Cancelada",
};

export const activityPriorityLabels: Record<ActivityPriority, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};
