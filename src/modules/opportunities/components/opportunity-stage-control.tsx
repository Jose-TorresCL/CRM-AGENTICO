"use client";

import { useActionState } from "react";
import type { OpportunityStage } from "@/generated/prisma/enums";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { ConfirmSubmitButton } from "@/shared/components/confirm-submit-button";
import { opportunityStageLabels } from "@/shared/constants/crm-labels";
import { changeOpportunityStageAction } from "../actions";
import { getNextOpportunityStages } from "../workflow";
import type { OpportunityFormState } from "../types";

const initialState: OpportunityFormState = {};
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export function OpportunityStageControl({
  id,
  stage,
  canCloseAsOwner,
}: {
  id: string;
  stage: OpportunityStage;
  canCloseAsOwner: boolean;
}) {
  const [state, action] = useActionState(changeOpportunityStageAction, initialState);
  const nextStages = getNextOpportunityStages(stage).filter(
    (nextStage) => nextStage !== "ganado" || canCloseAsOwner,
  );

  if (nextStages.length === 0) {
    return null;
  }

  return (
    <form action={action} className="space-y-3">
      <input name="id" type="hidden" value={id} />
      <label className="block space-y-2 text-sm font-medium">
        Avanzar etapa
        <select className={selectClass} defaultValue="" name="etapa" required>
          <option disabled value="">Selecciona etapa siguiente</option>
          {nextStages.map((nextStage) => (
            <option key={nextStage} value={nextStage}>{opportunityStageLabels[nextStage]}</option>
          ))}
        </select>
      </label>
      {nextStages.includes("perdido") ? (
        <label className="block space-y-2 text-sm font-medium">
          Motivo de pérdida (requerido si eliges Perdido)
          <textarea
            className="min-h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            maxLength={1000}
            name="motivoPerdida"
          />
        </label>
      ) : null}
      {nextStages.includes("ganado") ? (
        <label className="block space-y-2 text-sm font-medium">
          Motivo de excepción del owner (requerido si eliges Ganado)
          <textarea
            className="min-h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            maxLength={1000}
            name="excepcionOwnerMotivo"
          />
        </label>
      ) : null}
      <ActionFeedback error={state.error} message={state.message} />
      <ConfirmSubmitButton
        className="w-full"
        confirmation="¿Confirmas el cambio? Si elegiste Perdido, la oportunidad se cerrará."
        variant="outline"
      >
        Cambiar etapa
      </ConfirmSubmitButton>
    </form>
  );
}
