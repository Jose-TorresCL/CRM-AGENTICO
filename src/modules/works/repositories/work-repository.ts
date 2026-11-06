import "server-only";
import { getPrismaClient } from "@/server/db/prisma";

export async function listWorks() {
  return getPrismaClient().work.findMany({
    include: {
      cliente: { select: { id: true, nombre: true } },
      quote: { select: { id: true, numero: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });
}

export async function getWorkById(id: string) {
  return getPrismaClient().work.findUnique({
    where: { id },
    include: {
      cliente: true,
      quote: {
        select: {
          id: true,
          numero: true,
          fechaEmision: true,
          fechaVencimiento: true,
          estado: true,
        },
      },
    },
  });
}
