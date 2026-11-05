"use client";

import { useActionState } from "react";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { ConfirmSubmitButton } from "@/shared/components/confirm-submit-button";
import { cancelOpportunityAction } from "../actions";
import type { OpportunityFormState } from "../types";

const initialState: OpportunityFormState = {};

export function CancelOpportunityForm({ id }: { id: string }) {
  const [state, action] = useActionState(cancelOpportunityAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input name="id" type="hidden" value={id} />
      <label className="block space-y-2 text-sm font-medium">
        Motivo de cancelación
        <textarea
          className="min-h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          maxLength={1000}
          name="motivoCancelacion"
          required
        />
      </label>
      <ActionFeedback error={state.error} message={state.message} />
      <ConfirmSubmitButton
        className="w-full"
        confirmation="¿Confirmas cancelar esta oportunidad? La acción no se puede deshacer."
        variant="outline"
      >
        Cancelar oportunidad
      </ConfirmSubmitButton>
    </form>
  );
}
