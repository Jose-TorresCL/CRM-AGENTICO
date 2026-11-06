import "server-only";
import { Prisma } from "@/generated/prisma/client";
import type { QuoteStatus } from "@/generated/prisma/enums";
import { AppError } from "@/server/errors/app-error";
import { getPrismaClient } from "@/server/db/prisma";
import { getOpportunityStageAfterQuoteSent } from "@/modules/opportunities/workflow";
import type {
  CreateQuoteInput,
  UpdateQuoteInput,
} from "../schemas/quote-schemas";
import {
  getChileYear,
  isQuoteExpired,
} from "./quote-domain";
import {
  getQuoteById,
  listQuotes,
  listQuotesForOpportunity,
} from "../repositories/quote-repository";

type QuoteDraftData = Omit<CreateQuoteInput, "oportunidadId">;
type QuoteActor = { id: string };

function toQuoteData(input: QuoteDraftData) {
  return {
    fechaVencimiento: input.fechaVencimiento,
    alcance: input.alcance,
    tipoRevestimiento: input.tipoRevestimiento,
    superficie: new Prisma.Decimal(input.superficie.toString()),
    unidadSuperficie: input.unidadSuperficie,
    precioTotal: new Prisma.Decimal(input.precioTotal.toString()),
    costoEstimado: new Prisma.Decimal(input.costoEstimado.toString()),
    margenEstimado: new Prisma.Decimal((input.precioTotal - input.costoEstimado).toString()),
    anticipoRequerido: new Prisma.Decimal(input.anticipoRequerido.toString()),
    plazoDiasHabiles: input.plazoDiasHabiles,
    condiciones: input.condiciones,
    exclusiones: input.exclusiones ?? null,
  };
}

function isUniqueConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export async function searchQuotes(filters: Parameters<typeof listQuotes>[0]) {
  return listQuotes(filters);
}

export async function findQuote(id: string) {
  const quote = await getQuoteById(id);

  if (!quote) {
    throw new AppError("No se encontró la cotización.", 404);
  }

  return quote;
}

export async function findQuotesForOpportunity(oportunidadId: string) {
  return listQuotesForOpportunity(oportunidadId);
}

export async function saveQuote(input: CreateQuoteInput, actor: QuoteActor) {
  const now = new Date();

  if (isQuoteExpired(input.fechaVencimiento, now)) {
    throw new AppError("La fecha de vencimiento no puede estar en el pasado.", 400);
  }

  try {
    return await getPrismaClient().$transaction(async (transaction) => {
      const opportunity = await transaction.opportunity.findUnique({
        where: { id: input.oportunidadId },
        select: { id: true, clienteId: true, etapa: true, estado: true },
      });

      if (!opportunity) {
        throw new AppError("No se encontró la oportunidad.", 404);
      }

      if (opportunity.estado !== "abierta") {
        throw new AppError("Solo se pueden cotizar oportunidades abiertas.", 409);
      }

      const year = getChileYear(now);
      const counter = await transaction.quoteNumberCounter.upsert({
        where: { year },
        create: { year, lastValue: 1 },
        update: { lastValue: { increment: 1 } },
      });

      if (counter.lastValue > 999999) {
        throw new AppError("Se agotó la numeración anual de cotizaciones.", 409);
      }

      const numero = `QUO-${year}-${String(counter.lastValue).padStart(6, "0")}`;
      const quote = await transaction.quote.create({
        data: {
          numero,
          oportunidadId: opportunity.id,
          clienteId: opportunity.clienteId,
          ...toQuoteData(input),
          creadaPorId: actor.id,
          actualizadaPorId: actor.id,
        },
      });

      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          action: "quote.created",
          entity: "quotes",
          entityId: quote.id,
          metadata: { numero: quote.numero, oportunidadId: opportunity.id },
        },
      });

      return quote;
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isUniqueConflict(error)) {
      throw new AppError("La cotización cambió concurrentemente. Intenta nuevamente.", 409);
    }

    throw error;
  }
}

export async function editQuote(input: UpdateQuoteInput, actor: QuoteActor) {
  if (isQuoteExpired(input.fechaVencimiento, new Date())) {
    throw new AppError("La fecha de vencimiento no puede estar en el pasado.", 400);
  }

  const updated = await getPrismaClient().$transaction(async (transaction) => {
    const result = await transaction.quote.updateMany({
      where: { id: input.id, estado: "borrador" },
      data: {
        ...toQuoteData(input),
        actualizadaPorId: actor.id,
      },
    });

    if (result.count !== 1) {
      const existing = await transaction.quote.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!existing) {
        throw new AppError("No se encontró la cotización.", 404);
      }

      throw new AppError("Solo se pueden editar cotizaciones en borrador.", 409);
    }

    const quote = await transaction.quote.findUniqueOrThrow({
      where: { id: input.id },
      select: { numero: true },
    });

    await transaction.auditLog.create({
      data: {
        userId: actor.id,
        action: "quote.updated",
        entity: "quotes",
        entityId: input.id,
        metadata: { numero: quote.numero },
      },
    });

    return true;
  });

  return updated;
}

export async function sendQuote(id: string, actor: QuoteActor) {
  const now = new Date();

  return getPrismaClient().$transaction(async (transaction) => {
    const quote = await transaction.quote.findUnique({
      where: { id },
      include: { oportunidad: true },
    });

    if (!quote) {
      throw new AppError("No se encontró la cotización.", 404);
    }

    if (quote.estado !== "borrador") {
      throw new AppError("Solo se pueden enviar cotizaciones en borrador.", 409);
    }

    if (isQuoteExpired(quote.fechaVencimiento, now)) {
      throw new AppError("No se puede enviar una cotización con vencimiento pasado.", 400);
    }

    if (quote.oportunidad.estado !== "abierta") {
      throw new AppError("La oportunidad ya no está abierta.", 409);
    }

    const nextStage = getOpportunityStageAfterQuoteSent(quote.oportunidad.etapa);

    if (!nextStage) {
      throw new AppError("No se puede enviar una cotización para esta etapa de oportunidad.", 409);
    }

    const quoteUpdate = await transaction.quote.updateMany({
      where: { id, estado: "borrador" },
      data: { estado: "enviada", enviadaAt: now, enviadaPorId: actor.id, actualizadaPorId: actor.id },
    });

    if (quoteUpdate.count !== 1) {
      throw new AppError("La cotización cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    if (nextStage !== quote.oportunidad.etapa) {
      const opportunityUpdate = await transaction.opportunity.updateMany({
        where: {
          id: quote.oportunidadId,
          estado: "abierta",
          etapa: quote.oportunidad.etapa,
        },
        data: { etapa: nextStage },
      });

      if (opportunityUpdate.count !== 1) {
        throw new AppError("La oportunidad cambió. Actualiza la página e inténtalo nuevamente.", 409);
      }
    }

    await transaction.auditLog.create({
      data: {
        userId: actor.id,
        action: "quote.sent",
        entity: "quotes",
        entityId: id,
        metadata: { numero: quote.numero, registroManual: true },
      },
    });

    return quote.oportunidadId;
  });
}

export async function approveQuote(id: string, actor: QuoteActor) {
  const now = new Date();
  const result = await getPrismaClient().$transaction(async (transaction) => {
    const quote = await transaction.quote.findUnique({
      where: { id },
      include: { oportunidad: true },
    });

    if (!quote) {
      throw new AppError("No se encontró la cotización.", 404);
    }

    if (quote.estado !== "enviada") {
      throw new AppError("Solo se pueden aprobar cotizaciones enviadas.", 409);
    }

    if (isQuoteExpired(quote.fechaVencimiento, now)) {
      const expired = await transaction.quote.updateMany({
        where: { id, estado: "enviada" },
        data: {
          estado: "vencida",
          vencidaAt: now,
          vencidaPorId: actor.id,
          actualizadaPorId: actor.id,
        },
      });

      if (expired.count !== 1) {
        throw new AppError("La cotización cambió. Actualiza la página e inténtalo nuevamente.", 409);
      }

      await transaction.auditLog.create({
        data: {
          userId: actor.id,
          action: "quote.expired",
          entity: "quotes",
          entityId: id,
          metadata: { numero: quote.numero, motivo: "Intento de aprobación posterior al vencimiento." },
        },
      });

      return { expired: true as const, oportunidadId: quote.oportunidadId };
    }

    if (quote.oportunidad.estado !== "abierta" || ["ganado", "perdido"].includes(quote.oportunidad.etapa)) {
      throw new AppError("La oportunidad debe estar abierta para aprobar la cotización.", 409);
    }

    const opportunityUpdate = await transaction.opportunity.updateMany({
      where: {
        id: quote.oportunidadId,
        estado: "abierta",
        etapa: { notIn: ["ganado", "perdido"] },
      },
      data: { etapa: "ganado", estado: "ganada" },
    });

    if (opportunityUpdate.count !== 1) {
      throw new AppError("La oportunidad cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    const quoteUpdate = await transaction.quote.updateMany({
      where: { id, estado: "enviada" },
      data: {
        estado: "aprobada",
        aprobadaAt: now,
        aprobadaPorId: actor.id,
        actualizadaPorId: actor.id,
      },
    });

    if (quoteUpdate.count !== 1) {
      throw new AppError("La cotización cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    const remainingQuotes = await transaction.quote.findMany({
      where: {
        oportunidadId: quote.oportunidadId,
        id: { not: id },
        estado: { in: ["borrador", "enviada"] },
      },
      select: { id: true, numero: true },
    });
    const cancellationReason = `Anulada automáticamente al aprobar ${quote.numero}.`;

    if (remainingQuotes.length > 0) {
      const cancelledIds = remainingQuotes.map(({ id: quoteId }) => quoteId);
      const cancelled = await transaction.quote.updateMany({
        where: {
          id: { in: cancelledIds },
          estado: { in: ["borrador", "enviada"] },
        },
        data: {
          estado: "anulada",
          motivoAnulacion: cancellationReason,
          anuladaAt: now,
          anuladaPorId: actor.id,
          actualizadaPorId: actor.id,
        },
      });

      if (cancelled.count !== remainingQuotes.length) {
        throw new AppError("Las otras cotizaciones cambiaron. Actualiza la página e inténtalo nuevamente.", 409);
      }

      await transaction.auditLog.createMany({
        data: remainingQuotes.map((remaining) => ({
          userId: actor.id,
          action: "quote.annulled",
          entity: "quotes",
          entityId: remaining.id,
          metadata: {
            numero: remaining.numero,
            motivo: cancellationReason,
            automatico: true,
            cotizacionAprobada: quote.numero,
          },
        })),
      });
    }

    await transaction.auditLog.createMany({
      data: [
        {
          userId: actor.id,
          action: "quote.approved",
          entity: "quotes",
          entityId: id,
          metadata: { numero: quote.numero, precioTotal: quote.precioTotal.toString() },
        },
        {
          userId: actor.id,
          action: "opportunity.won.quote_approved",
          entity: "opportunities",
          entityId: quote.oportunidadId,
          metadata: { quoteId: id, numero: quote.numero },
        },
      ],
    });

    return { expired: false as const, oportunidadId: quote.oportunidadId };
  });

  if (result.expired) {
    throw new AppError("La cotización venció y no puede aprobarse. Se registró como vencida.", 409);
  }

  return result.oportunidadId;
}

export async function rejectQuote(id: string, reason: string, actor: QuoteActor) {
  return transitionQuote(id, "enviada", "rechazada", actor, {
    motivoRechazo: reason,
    rechazadaAt: new Date(),
    rechazadaPorId: actor.id,
    auditAction: "quote.rejected",
  });
}

export async function annulQuote(id: string, reason: string, actor: QuoteActor) {
  const quote = await getPrismaClient().quote.findUnique({
    where: { id },
    select: { estado: true },
  });

  if (!quote) {
    throw new AppError("No se encontró la cotización.", 404);
  }

  if (quote.estado !== "borrador" && quote.estado !== "enviada") {
    throw new AppError("Solo se pueden anular cotizaciones en borrador o enviadas.", 409);
  }

  return transitionQuote(id, quote.estado, "anulada", actor, {
    motivoAnulacion: reason,
    anuladaAt: new Date(),
    anuladaPorId: actor.id,
    auditAction: "quote.annulled",
  });
}

async function transitionQuote(
  id: string,
  expectedStatus: QuoteStatus,
  nextStatus: QuoteStatus,
  actor: QuoteActor,
  data: {
    motivoRechazo?: string;
    rechazadaAt?: Date;
    rechazadaPorId?: string;
    motivoAnulacion?: string;
    anuladaAt?: Date;
    anuladaPorId?: string;
    auditAction: string;
  },
) {
  return getPrismaClient().$transaction(async (transaction) => {
    const quote = await transaction.quote.findUnique({
      where: { id },
      select: { id: true, numero: true },
    });

    if (!quote) {
      throw new AppError("No se encontró la cotización.", 404);
    }

    const updated = await transaction.quote.updateMany({
      where: { id, estado: expectedStatus },
      data: {
        estado: nextStatus,
        actualizadaPorId: actor.id,
        ...(data.motivoRechazo ? { motivoRechazo: data.motivoRechazo } : {}),
        ...(data.rechazadaAt ? { rechazadaAt: data.rechazadaAt } : {}),
        ...(data.rechazadaPorId ? { rechazadaPorId: data.rechazadaPorId } : {}),
        ...(data.motivoAnulacion ? { motivoAnulacion: data.motivoAnulacion } : {}),
        ...(data.anuladaAt ? { anuladaAt: data.anuladaAt } : {}),
        ...(data.anuladaPorId ? { anuladaPorId: data.anuladaPorId } : {}),
      },
    });

    if (updated.count !== 1) {
      throw new AppError("La cotización cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    await transaction.auditLog.create({
      data: {
        userId: actor.id,
        action: data.auditAction,
        entity: "quotes",
        entityId: id,
        metadata: {
          numero: quote.numero,
          ...(data.motivoRechazo ? { motivo: data.motivoRechazo } : {}),
          ...(data.motivoAnulacion ? { motivo: data.motivoAnulacion } : {}),
        },
      },
    });

    return true;
  });
}

export async function expireQuote(id: string, actor: QuoteActor) {
  const now = new Date();

  return getPrismaClient().$transaction(async (transaction) => {
    const quote = await transaction.quote.findUnique({
      where: { id },
      select: { numero: true, estado: true, fechaVencimiento: true },
    });

    if (!quote) {
      throw new AppError("No se encontró la cotización.", 404);
    }

    if (quote.estado !== "enviada" || !isQuoteExpired(quote.fechaVencimiento, now)) {
      throw new AppError("Solo se pueden vencer cotizaciones enviadas cuya fecha ya pasó.", 409);
    }

    const updated = await transaction.quote.updateMany({
      where: { id, estado: "enviada" },
      data: {
        estado: "vencida",
        vencidaAt: now,
        vencidaPorId: actor.id,
        actualizadaPorId: actor.id,
      },
    });

    if (updated.count !== 1) {
      throw new AppError("La cotización cambió. Actualiza la página e inténtalo nuevamente.", 409);
    }

    await transaction.auditLog.create({
      data: {
        userId: actor.id,
        action: "quote.expired",
        entity: "quotes",
        entityId: id,
        metadata: { numero: quote.numero },
      },
    });

    return true;
  });
}

export async function convertApprovedQuoteToWork(
  id: string,
  address: string,
  commune: string,
  actor: QuoteActor,
) {
  try {
    return await getPrismaClient().$transaction(async (transaction) => {
      const quote = await transaction.quote.findUnique({
        where: { id },
        include: { obra: true },
      });

      if (!quote) {
        throw new AppError("No se encontró la cotización.", 404);
      }

      if (quote.estado !== "aprobada") {
        throw new AppError("Solo una cotización aprobada puede convertirse en obra.", 409);
      }

      if (quote.obra) {
        throw new AppError("Esta cotización ya fue convertida en obra.", 409);
      }

      const work = await transaction.work.create({
        data: {
          quoteId: quote.id,
          clienteId: quote.clienteId,
          estado: "programada",
          direccion: address,
          comuna: commune,
          alcance: quote.alcance,
          tipoRevestimiento: quote.tipoRevestimiento,
          superficie: quote.superficie,
          unidadSuperficie: quote.unidadSuperficie,
          precioContratado: quote.precioTotal,
          costoEstimadoSnapshot: quote.costoEstimado,
          margenEstimadoSnapshot: quote.margenEstimado,
          anticipoRequerido: quote.anticipoRequerido,
          plazoDiasHabiles: quote.plazoDiasHabiles,
          condiciones: quote.condiciones,
          exclusiones: quote.exclusiones,
          creadaPorId: actor.id,
        },
      });

      await transaction.auditLog.createMany({
        data: [
          {
            userId: actor.id,
            action: "quote.converted_to_work",
            entity: "quotes",
            entityId: quote.id,
            metadata: { numero: quote.numero, workId: work.id },
          },
          {
            userId: actor.id,
            action: "work.created_from_quote",
            entity: "works",
            entityId: work.id,
            metadata: { quoteId: quote.id, numeroCotizacion: quote.numero },
          },
        ],
      });

      return work;
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isUniqueConflict(error)) {
      throw new AppError("Esta cotización ya fue convertida en obra.", 409);
    }

    throw error;
  }
}
