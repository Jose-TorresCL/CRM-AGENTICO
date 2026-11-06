"use client";

import { useActionState } from "react";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { ConfirmSubmitButton } from "@/shared/components/confirm-submit-button";
import { SubmitButton } from "@/shared/components/submit-button";
import type { QuoteStatus } from "@/generated/prisma/enums";
import {
  annulQuoteAction,
  approveQuoteAction,
  expireQuoteAction,
  rejectQuoteAction,
  sendQuoteAction,
} from "../actions";
import type { QuoteFormState } from "../types";

const initialState: QuoteFormState = {};

export function QuoteControls({
  id,
  status,
  expired,
}: {
  id: string;
  status: QuoteStatus;
  expired: boolean;
}) {
  const [sendState, sendAction] = useActionState(sendQuoteAction, initialState);
  const [approveState, approveAction] = useActionState(approveQuoteAction, initialState);
  const [rejectState, rejectAction] = useActionState(rejectQuoteAction, initialState);
  const [annulState, annulAction] = useActionState(annulQuoteAction, initialState);
  const [expireState, expireAction] = useActionState(expireQuoteAction, initialState);

  if (status !== "borrador" && status !== "enviada") {
    return null;
  }

  return (
    <div className="space-y-5">
      {status === "borrador" ? (
        <form action={sendAction} className="space-y-2">
          <input name="id" type="hidden" value={id} />
          <ActionFeedback error={sendState.error} message={sendState.message} />
          <ConfirmSubmitButton confirmation="¿Registrar manualmente el envío de esta cotización? No se enviará ningún mensaje ni correo.">
            Registrar envío
          </ConfirmSubmitButton>
        </form>
      ) : null}

      {status === "enviada" && expired ? (
        <form action={expireAction} className="space-y-2">
          <input name="id" type="hidden" value={id} />
          <p className="text-sm text-amber-800">Venció según la fecha local de Chile; no se puede aprobar.</p>
          <ActionFeedback error={expireState.error} message={expireState.message} />
          <SubmitButton variant="outline">Marcar vencida</SubmitButton>
        </form>
      ) : null}

      {status === "enviada" && !expired ? (
        <>
          <form action={approveAction} className="space-y-2">
            <input name="id" type="hidden" value={id} />
            <ActionFeedback error={approveState.error} message={approveState.message} />
            <ConfirmSubmitButton confirmation="¿Confirmas aprobar la cotización y marcar la oportunidad como ganada? Las otras cotizaciones abiertas se anularán.">
              Aprobar cotización
            </ConfirmSubmitButton>
          </form>
          <form action={rejectAction} className="space-y-2">
            <input name="id" type="hidden" value={id} />
            <label className="block space-y-1 text-sm font-medium">
              Motivo de rechazo <span className="text-red-700">*</span>
              <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" maxLength={1000} name="motivo" required />
            </label>
            <ActionFeedback error={rejectState.error} message={rejectState.message} />
            <ConfirmSubmitButton confirmation="¿Registrar el rechazo? La oportunidad mantendrá su etapa.">
              Registrar rechazo
            </ConfirmSubmitButton>
          </form>
        </>
      ) : null}

      {status === "borrador" || (status === "enviada" && !expired) ? (
        <form action={annulAction} className="space-y-2">
          <input name="id" type="hidden" value={id} />
          <label className="block space-y-1 text-sm font-medium">
            Motivo de anulación <span className="text-red-700">*</span>
            <textarea className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2" maxLength={1000} name="motivo" required />
          </label>
          <ActionFeedback error={annulState.error} message={annulState.message} />
          <ConfirmSubmitButton confirmation="¿Confirmas anular esta cotización? El cambio es irreversible.">
            Anular cotización
          </ConfirmSubmitButton>
        </form>
      ) : null}
    </div>
  );
}
