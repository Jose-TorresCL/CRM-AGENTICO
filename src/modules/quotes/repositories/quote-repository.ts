import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { QuoteFilters } from "../schemas/quote-schemas";

export async function listQuotes(filters: QuoteFilters) {
  const where: Prisma.QuoteWhereInput = {
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.search
      ? {
          OR: [
            { numero: { contains: filters.search, mode: "insensitive" } },
            { cliente: { nombre: { contains: filters.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  return getPrismaClient().quote.findMany({
    where,
    include: {
      cliente: { select: { id: true, nombre: true } },
      oportunidad: { select: { id: true, etapa: true } },
      obra: { select: { id: true } },
    },
    orderBy: [{ createdAt: "desc" }, { numero: "desc" }],
    take: 200,
  });
}

export async function getQuoteById(id: string) {
  return getPrismaClient().quote.findUnique({
    where: { id },
    include: {
      cliente: true,
      oportunidad: {
        select: { id: true, etapa: true, estado: true },
      },
      obra: { select: { id: true, estado: true } },
    },
  });
}

export async function listQuotesForOpportunity(oportunidadId: string) {
  return getPrismaClient().quote.findMany({
    where: { oportunidadId },
    select: {
      id: true,
      numero: true,
      estado: true,
      precioTotal: true,
      margenEstimado: true,
      fechaVencimiento: true,
      obra: { select: { id: true } },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}
