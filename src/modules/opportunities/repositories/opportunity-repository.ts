import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { OpportunityStage } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/server/db/prisma";
import type { OpportunityFilters } from "../types";
import type { OpportunityInput } from "../schemas/opportunity-schemas";

export async function listOpportunities(filters: OpportunityFilters) {
  const where: Prisma.OpportunityWhereInput = {
    ...(filters.etapa ? { etapa: filters.etapa } : {}),
    ...(filters.origen ? { origen: filters.origen } : {}),
    ...(filters.responsableId ? { responsableId: filters.responsableId } : {}),
    ...(filters.comuna
      ? { comuna: { contains: filters.comuna, mode: "insensitive" } }
      : {}),
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.desde || filters.hasta
      ? {
          fechaProximaAccion: {
            ...(filters.desde ? { gte: filters.desde } : {}),
            ...(filters.hasta ? { lt: filters.hasta } : {}),
          },
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { cliente: { nombre: { contains: filters.search, mode: "insensitive" } } },
            { proximaAccion: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return getPrismaClient().opportunity.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true, comuna: true, telefono: true } },
      _count: { select: { activities: true } },
    },
    orderBy: [{ fechaProximaAccion: "asc" }, { updatedAt: "desc" }],
    take: 200,
  });
}

export async function getOpportunityById(id: string) {
  return getPrismaClient().opportunity.findUnique({
    where: { id },
    include: {
      cliente: true,
      activities: {
        orderBy: { fechaHora: "desc" },
        include: { responsable: { select: { id: true } } },
      },
    },
  });
}

export async function listOpportunitiesForClient(clienteId: string) {
  return getPrismaClient().opportunity.findMany({
    where: { clienteId },
    select: { id: true, etapa: true, estado: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });
}

export async function createOpportunity(data: OpportunityInput) {
  return getPrismaClient().opportunity.create({ data });
}

export async function updateOpportunity(
  id: string,
  expectedStage: OpportunityStage,
  data: OpportunityInput,
) {
  const result = await getPrismaClient().opportunity.updateMany({
    where: { id, etapa: expectedStage, estado: "abierta" },
    data,
  });

  return result.count;
}

export async function cancelOpportunityRecord(
  id: string,
  expectedStage: OpportunityStage,
  reason: string,
) {
  const result = await getPrismaClient().opportunity.updateMany({
    where: { id, etapa: expectedStage, estado: "abierta" },
    data: { estado: "cancelada", motivoCancelacion: reason },
  });

  return result.count;
}

export async function listOpenPipelineOpportunities(
  filters: Pick<OpportunityFilters, "responsableId" | "origen" | "desde" | "hasta">,
) {
  return getPrismaClient().opportunity.findMany({
    where: {
      estado: { in: ["abierta", "ganada", "perdida"] },
      ...(filters.responsableId ? { responsableId: filters.responsableId } : {}),
      ...(filters.origen ? { origen: filters.origen } : {}),
      ...(filters.desde || filters.hasta
        ? {
            fechaProximaAccion: {
              ...(filters.desde ? { gte: filters.desde } : {}),
              ...(filters.hasta ? { lt: filters.hasta } : {}),
            },
          }
        : {}),
    },
    include: {
      cliente: { select: { id: true, nombre: true, comuna: true } },
    },
    orderBy: [{ fechaProximaAccion: "asc" }, { updatedAt: "desc" }],
    take: 300,
  });
}

export async function getOpportunityForTransition(id: string) {
  return getPrismaClient().opportunity.findUnique({ where: { id } });
}

export async function getOpportunityCommunes() {
  const communes = await getPrismaClient().opportunity.findMany({
    where: { comuna: { not: null } },
    distinct: ["comuna"],
    select: { comuna: true },
    orderBy: { comuna: "asc" },
  });

  return communes.flatMap(({ comuna }) => (comuna ? [comuna] : []));
}
