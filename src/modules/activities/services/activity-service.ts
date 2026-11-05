import "server-only";
import { AppError } from "@/server/errors/app-error";
import {
  createActivity,
  getActivityById,
  getOpportunityClientId,
  listActivities,
  transitionActivityStatus,
  updateActivity,
} from "../repositories/activity-repository";
import type {
  ActivityInput,
  completeActivitySchema,
} from "../schemas/activity-schemas";
import type { ActivityFilters } from "../types";
import type { z } from "zod";

export async function searchActivities(
  filters: ActivityFilters,
  dateBounds?: { start: Date; end?: Date },
) {
  return listActivities(filters, dateBounds);
}

export async function findActivity(id: string) {
  const activity = await getActivityById(id);

  if (!activity) {
    throw new AppError("No se encontró la actividad.", 404);
  }

  return activity;
}

export async function saveActivity(input: ActivityInput) {
  await ensureOpportunityBelongsToClient(input.oportunidadId, input.clienteId);
  return createActivity(input);
}

export async function editActivity(id: string, input: ActivityInput) {
  const existing = await getActivityById(id);

  if (!existing) {
    throw new AppError("No se encontró la actividad.", 404);
  }

  if (existing.estado === "completada" || existing.estado === "cancelada") {
    throw new AppError("No se puede editar una actividad cerrada.", 409);
  }

  await ensureOpportunityBelongsToClient(input.oportunidadId, input.clienteId);
  return updateActivity(id, input);
}

type ActivityCompletion = z.infer<typeof completeActivitySchema>;

export async function completeActivity(input: ActivityCompletion) {
  const activity = await getActivityById(input.id);

  if (!activity) {
    throw new AppError("No se encontró la actividad.", 404);
  }

  if (activity.estado === "cancelada" || activity.estado === "completada") {
    throw new AppError("La actividad ya está cerrada.", 409);
  }

  const result = await transitionActivityStatus(
    input.id,
    activity.estado,
    "completada",
    input.resultado,
  );

  if (result !== 1) {
    throw new AppError("La actividad cambió. Actualiza la página e inténtalo nuevamente.", 409);
  }

  return true;
}

export async function cancelActivity(id: string) {
  const activity = await getActivityById(id);

  if (!activity) {
    throw new AppError("No se encontró la actividad.", 404);
  }

  if (activity.estado === "completada" || activity.estado === "cancelada") {
    throw new AppError("La actividad ya está cerrada.", 409);
  }

  const result = await transitionActivityStatus(id, activity.estado, "cancelada");

  if (result !== 1) {
    throw new AppError("La actividad cambió. Actualiza la página e inténtalo nuevamente.", 409);
  }

  return true;
}

async function ensureOpportunityBelongsToClient(
  opportunityId: string | undefined,
  clientId: string,
) {
  if (!opportunityId) {
    return;
  }

  const opportunityClientId = await getOpportunityClientId(opportunityId);

  if (!opportunityClientId) {
    throw new AppError("No se encontró la oportunidad asociada.", 404);
  }

  if (opportunityClientId !== clientId) {
    throw new AppError("La oportunidad debe pertenecer al cliente seleccionado.", 400);
  }
}
