"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { ConfirmSubmitButton } from "@/shared/components/confirm-submit-button";
import { Input } from "@/shared/components/ui/input";
import { convertQuoteToWorkAction } from "../actions";
import type { QuoteFormState } from "../types";

const initialState: QuoteFormState = {};

export function QuoteWorkConversionForm({
  id,
  address,
  commune,
}: {
  id: string;
  address: string;
  commune: string;
}) {
  const [state, action] = useActionState(convertQuoteToWorkAction, initialState);

  if (state.workId) {
    return (
      <div className="space-y-2">
        <ActionFeedback message={state.message} />
        <Link className="text-sm text-blue-700 underline" href={`/obras/${state.workId}`}>
          Ver obra programada
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input name="id" type="hidden" value={id} />
      <p className="text-sm text-slate-600">
        Confirma la ubicación. El alcance y las condiciones se conservarán desde la cotización aprobada.
      </p>
      <label className="block space-y-1 text-sm font-medium">
        Dirección de la obra <span className="text-red-700">*</span>
        <Input defaultValue={address} maxLength={240} name="direccion" required />
      </label>
      <label className="block space-y-1 text-sm font-medium">
        Comuna <span className="text-red-700">*</span>
        <Input defaultValue={commune} maxLength={120} name="comuna" required />
      </label>
      <ActionFeedback error={state.error} message={state.message} />
      <ConfirmSubmitButton confirmation="¿Confirmas crear la obra inicial en estado programada? No se crearán fechas, asignaciones ni pagos.">
        Crear obra inicial
      </ConfirmSubmitButton>
    </form>
  );
}
