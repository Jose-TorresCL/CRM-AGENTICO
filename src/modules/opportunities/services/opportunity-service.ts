import "server-only";
import type { UserRole } from "@/generated/prisma/enums";
import { getPrismaClient } from "@/server/db/prisma";
import { AppError } from "@/server/errors/app-error";
import {
  cancelOpportunityRecord,
  createOpportunity,
  getOpportunityById,
  getOpportunityCommunes,
  getOpportunityForTransition,
  listOpportunitiesForClient as getClientOpportunities,
  listOpenPipelineOpportunities,
  listOpportunities,
  updateOpportunity,
} from "../repositories/opportunity-repository";
import type {
  changeOpportunityStageSchema,
} from "../schemas/opportunity-schemas";
import type { OpportunityFilters } from "../types";
import type { OpportunityInput } from "../schemas/opportunity-schemas";
import type { z } from "zod";
import { getNextOpportunityStages } from "../workflow";

export async function searchOpportunities(filters: OpportunityFilters) {
  return listOpportunities(filters);
}

export async function findOpportunity(id: string) {
  const opportunity = await getOpportunityById(id);

  if (!opportunity) {
    throw new AppError("No se encontró la oportunidad.", 404);
  }

  return opportunity;
}

export async function saveOpportunity(input: OpportunityInput) {
  return createOpportunity(input);
}

export async function editOpportunity(id: string, input: OpportunityInput) {
  const existing = await getOpportunityForTransition(id);

  if (!existing) {
    throw new AppError("No se encontró la oportunidad.", 404);
  }

  if (existing.estado !== "abierta") {
    throw new AppError("No se puede editar una oportunidad cerrada.", 409);
  }

  return updateOpportunity(id, input);
}

export async function searchPipeline(filters: OpportunityFilters) {
  return listOpenPipelineOpportunities(filters);
}

export async function listOpportunityCommunes() {
  return getOpportunityCommunes();
}

export async function listOpportunitiesForClient(clienteId: string) {
  return getClientOpportunities(clienteId);
}

type StageChange = z.infer<typeof changeOpportunityStageSchema>;

export async function changeOpportunityStage(
  input: StageChange,
  actor: { id: string; roles: readonly UserRole[] },
) {
  const current = await getOpportunityForTransition(input.id);

  if (!current) {
    throw new AppError("No se encontró la oportunidad.", 404);
  }

  if (current.estado !== "abierta") {
    throw new AppError("La oportunidad ya está cerrada.", 409);
  }

  if (!getNextOpportunityStages(current.etapa).includes(input.etapa)) {
    throw new AppError(
      `No se permite pasar de ${current.etapa} a ${input.etapa}.`,
      409,
    );
  }

  if (input.etapa === "perdido" && !input.motivoPerdida) {
    throw new AppError("Debes indicar el motivo de pérdida.", 400);
  }

  if (input.etapa === "ganado") {
    if (!actor.roles.includes("owner")) {
      throw new AppError(
        "Hasta que existan cotizaciones aprobadas, solo el owner puede autorizar este cierre.",
        403,
      );
    }

    if (!input.excepcionOwnerMotivo) {
      throw new AppError("Registra el motivo de la excepción del owner.", 400);
    }
  }

  const updated = await getPrismaClient().$transaction(async (transaction) => {
    const result = await transaction.opportunity.updateMany({
      where: {
        id: input.id,
        etapa: current.etapa,
        estado: "abierta",
      },
      data: {
        etapa: input.etapa,
        estado: input.etapa === "ganado" ? "ganada" : input.etapa === "perdido" ? "perdida" : "abierta",
        ...(input.etapa === "perdido" ? { motivoPerdida: input.motivoPerdida } : {}),
      },
    });

    if (result.count !== 1) {
      throw new AppError("La oportunidad cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    if (input.etapa === "ganado") {
      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          action: "opportunity.won.owner_exception",
          entity: "opportunities",
          entityId: input.id,
          metadata: {
            motivo: input.excepcionOwnerMotivo,
            etapaAnterior: current.etapa,
          },
        },
      });
    }

    return transaction.opportunity.findUniqueOrThrow({ where: { id: input.id } });
  });

  return updated;
}

export async function cancelOpportunity(id: string, reason: string) {
  const current = await getOpportunityForTransition(id);

  if (!current) {
    throw new AppError("No se encontró la oportunidad.", 404);
  }

  if (current.estado !== "abierta") {
    throw new AppError("La oportunidad ya está cerrada.", 409);
  }

  const result = await cancelOpportunityRecord(id, current.etapa, reason);

  if (result !== 1) {
    throw new AppError("La oportunidad cambió. Actualiza la página e inténtalo nuevamente.", 409);
  }

  return true;
}
