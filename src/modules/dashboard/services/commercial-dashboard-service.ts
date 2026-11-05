import "server-only";
import { getPrismaClient } from "@/server/db/prisma";
import { getChileDayBounds } from "@/shared/lib/chile-datetime";

export async function getCommercialDashboard() {
  const prisma = getPrismaClient();
  const { start, end } = getChileDayBounds();

  const [
    newOpportunities,
    opportunitiesWithoutNextAction,
    stages,
    pipelineValue,
    activitiesTodayCount,
    activitiesToday,
    overdueActivitiesCount,
    overdueActivities,
    criticalActivities,
  ] = await Promise.all([
    prisma.opportunity.count({
      where: { etapa: "nuevo", estado: "abierta" },
    }),
    prisma.opportunity.count({
      where: {
        estado: "abierta",
        proximaAccion: null,
        fechaProximaAccion: null,
      },
    }),
    prisma.opportunity.groupBy({
      by: ["etapa"],
      where: { estado: "abierta" },
      _count: { _all: true },
    }),
    prisma.opportunity.aggregate({
      where: { estado: "abierta" },
      _sum: { valorEstimado: true },
    }),
    prisma.activity.count({
      where: {
        fechaHora: { gte: start, lt: end },
        estado: { in: ["pendiente", "en_curso"] },
      },
    }),
    prisma.activity.findMany({
      where: {
        fechaHora: { gte: start, lt: end },
        estado: { in: ["pendiente", "en_curso"] },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: [{ fechaHora: "asc" }, { prioridad: "desc" }],
      take: 10,
    }),
    prisma.activity.count({
      where: {
        fechaHora: { lt: start },
        estado: { in: ["pendiente", "en_curso"] },
      },
    }),
    prisma.activity.findMany({
      where: {
        fechaHora: { lt: start },
        estado: { in: ["pendiente", "en_curso"] },
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: [{ fechaHora: "asc" }, { prioridad: "desc" }],
      take: 10,
    }),
    prisma.activity.findMany({
      where: {
        estado: { in: ["pendiente", "en_curso"] },
        prioridad: "critica",
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: [{ fechaHora: "asc" }, { prioridad: "desc" }],
      take: 10,
    }),
  ]);

  return {
    newOpportunities,
    opportunitiesWithoutNextAction,
    stages,
    pipelineValue: pipelineValue._sum.valorEstimado ?? 0,
    activitiesTodayCount,
    activitiesToday,
    overdueActivitiesCount,
    overdueActivities,
    criticalActivities,
  };
}
