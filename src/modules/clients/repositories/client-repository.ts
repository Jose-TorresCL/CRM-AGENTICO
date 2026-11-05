import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import type { ClientFilters } from "../types";
import type { ClientInput } from "../schemas/client-schemas";

export async function listClients(filters: ClientFilters) {
  const where: Prisma.ClientWhereInput = {
    ...(filters.estado ? { estado: filters.estado } : {}),
    ...(filters.tipoCliente ? { tipoCliente: filters.tipoCliente } : {}),
    ...(filters.comuna
      ? { comuna: { contains: filters.comuna, mode: "insensitive" } }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { nombre: { contains: filters.search, mode: "insensitive" } },
            { telefono: { contains: filters.search, mode: "insensitive" } },
            { whatsapp: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  return getPrismaClient().client.findMany({
    where,
    include: {
      _count: { select: { opportunities: true, activities: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { nombre: "asc" }],
    take: 100,
  });
}

export async function getClientById(id: string) {
  return getPrismaClient().client.findUnique({
    where: { id },
    include: {
      opportunities: {
        orderBy: { updatedAt: "desc" },
        include: { _count: { select: { activities: true } } },
      },
      activities: {
        orderBy: { fechaHora: "desc" },
        take: 50,
        include: { oportunidad: { select: { id: true, etapa: true } } },
      },
    },
  });
}

export async function createClient(data: ClientInput) {
  return getPrismaClient().client.create({ data });
}

export async function updateClient(id: string, data: ClientInput) {
  return getPrismaClient().client.update({ where: { id }, data });
}

export async function getClientCommunes() {
  const communes = await getPrismaClient().client.findMany({
    where: { comuna: { not: null } },
    distinct: ["comuna"],
    select: { comuna: true },
    orderBy: { comuna: "asc" },
  });

  return communes.flatMap(({ comuna }) => (comuna ? [comuna] : []));
}
