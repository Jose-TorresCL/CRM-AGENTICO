import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { ActivityFilters } from "../types";
import type { ActivityInput } from "../schemas/activity-schemas";

export async function listActivities(
  filters: ActivityFilters,
  dateBounds?: { start: Date; end?: Date },
) {
  const where: Prisma.ActivityWhereInput = {
    ...(filters.tipo ? { tipo: filters.tipo } : {}),
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.responsableId ? { responsableId: filters.responsableId } : {}),
    ...(filters.clienteId ? { clienteId: filters.clienteId } : {}),
    ...(filters.oportunidadId ? { oportunidadId: filters.oportunidadId } : {}),
    ...(filters.periodo === "hoy" && dateBounds
      ? { fechaHora: { gte: dateBounds.start, lt: dateBounds.end } }
      : {}),
    ...(filters.periodo === "vencidas" && dateBounds
      ? {
          fechaHora: { lt: dateBounds.start },
          estado: { in: ["pendiente", "en_curso"] },
        }
      : {}),
  };

  return getPrismaClient().activity.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true } },
      oportunidad: { select: { id: true, etapa: true } },
    },
    orderBy: [{ fechaHora: "asc" }, { prioridad: "desc" }],
    take: 300,
  });
}

export async function getActivityById(id: string) {
  return getPrismaClient().activity.findUnique({ where: { id } });
}

export async function createActivity(data: ActivityInput) {
  return getPrismaClient().activity.create({ data });
}

export async function updateActivity(
  id: string,
  expectedStatus: "pendiente" | "en_curso",
  data: Prisma.ActivityUncheckedUpdateInput,
) {
  const result = await getPrismaClient().activity.updateMany({
    where: { id, estado: expectedStatus },
    data,
  });

  return result.count;
}

export async function transitionActivityStatus(
  id: string,
  currentStatus: "pendiente" | "en_curso",
  status: "completada" | "cancelada",
  resultado?: string,
) {
  const result = await getPrismaClient().activity.updateMany({
    where: { id, estado: currentStatus },
    data: {
      estado: status,
      ...(resultado ? { resultado } : {}),
    },
  });

  return result.count;
}

export async function getOpportunityClientId(id: string) {
  const opportunity = await getPrismaClient().opportunity.findUnique({
    where: { id },
    select: { clienteId: true },
  });

  return opportunity?.clienteId ?? null;
}
