import type {
  ActivityStatus,
  ActivityType,
} from "@/generated/prisma/enums";

export type ActivityFilters = {
  tipo?: ActivityType;
  estado?: ActivityStatus;
  responsableId?: string;
  clienteId?: string;
  oportunidadId?: string;
  periodo?: "hoy" | "vencidas";
};

export type ActivityFormState = {
  error?: string;
  message?: string;
};
