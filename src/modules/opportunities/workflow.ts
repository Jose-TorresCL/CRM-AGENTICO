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

export function getOpportunityStageAfterQuoteSent(
  stage: OpportunityStage,
): OpportunityStage | null {
  if (stage === "nuevo" || stage === "contactado" || stage === "visita_agendada") {
    return "cotizado";
  }

  if (stage === "cotizado" || stage === "negociacion") {
    return stage;
  }

  return null;
}
