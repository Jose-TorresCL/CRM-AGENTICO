import type { OpportunityStage } from "@/generated/prisma/enums";

const transitions: Record<OpportunityStage, readonly OpportunityStage[]> = {
  nuevo: ["contactado"],
  contactado: ["visita_agendada"],
  visita_agendada: ["cotizado"],
  cotizado: ["negociacion"],
  negociacion: ["ganado", "perdido"],
  ganado: [],
  perdido: [],
};

export function getNextOpportunityStages(stage: OpportunityStage) {
  return transitions[stage];
}
