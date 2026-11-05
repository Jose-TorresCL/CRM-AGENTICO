"use client";

import { useActionState } from "react";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { ConfirmSubmitButton } from "@/shared/components/confirm-submit-button";
import { SubmitButton } from "@/shared/components/submit-button";
import { Input } from "@/shared/components/ui/input";
import {
  cancelActivityAction,
  completeActivityAction,
} from "../actions";
import type { ActivityFormState } from "../types";

const initialState: ActivityFormState = {};

export function ActivityControls({
  id,
  canEdit,
}: {
  id: string;
  canEdit: boolean;
}) {
  const [completeState, completeAction] = useActionState(
    completeActivityAction,
    initialState,
  );
  const [cancelState, cancelAction] = useActionState(
    cancelActivityAction,
    initialState,
  );

  if (!canEdit) {
    return null;
  }

  return (
    <div className="space-y-3">
      <form action={completeAction} className="flex flex-wrap gap-2">
        <input name="id" type="hidden" value={id} />
        <label className="sr-only" htmlFor={`result-${id}`}>Resultado</label>
        <Input
          className="min-w-40 flex-1"
          id={`result-${id}`}
          maxLength={3000}
          name="resultado"
          placeholder="Resultado de la actividad"
          required
        />
        <SubmitButton pendingText="Completando..." variant="outline">
          Completar
        </SubmitButton>
        <ActionFeedback error={completeState.error} message={completeState.message} />
      </form>
      <form action={cancelAction}>
        <input name="id" type="hidden" value={id} />
        <ActionFeedback error={cancelState.error} message={cancelState.message} />
        <ConfirmSubmitButton
          className="h-8 px-3 text-xs"
          confirmation="¿Confirmas cancelar esta actividad?"
          size="sm"
          variant="ghost"
        >
          Cancelar
        </ConfirmSubmitButton>
      </form>
    </div>
  );
}
