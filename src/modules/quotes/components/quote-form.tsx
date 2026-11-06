"use client";

import { useActionState } from "react";
import type { ServiceType } from "@/generated/prisma/enums";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { Input } from "@/shared/components/ui/input";
import { SubmitButton } from "@/shared/components/submit-button";
import {
  quoteSurfaceUnitLabels,
  serviceTypeLabels,
} from "@/shared/constants/crm-labels";
import { createQuoteAction, updateQuoteAction } from "../actions";
import type { QuoteFormState } from "../types";

type QuoteFormValues = {
  id?: string;
  fechaVencimiento?: string;
  alcance?: string;
  tipoRevestimiento?: ServiceType;
  superficie?: string | number;
  unidadSuperficie?: "m2" | "unidad";
  precioTotal?: string | number;
  costoEstimado?: string | number;
  anticipoRequerido?: string | number;
  plazoDiasHabiles?: number;
  condiciones?: string;
  exclusiones?: string | null;
};

const initialState: QuoteFormState = {};
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export function QuoteForm({
  opportunityId,
  initial,
}: {
  opportunityId?: string;
  initial?: QuoteFormValues;
}) {
  const actionFunction = initial?.id ? updateQuoteAction : createQuoteAction;
  const [state, action] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="space-y-5">
      {initial?.id ? <input name="id" type="hidden" value={initial.id} /> : null}
      {opportunityId ? <input name="oportunidadId" type="hidden" value={opportunityId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Válida hasta <span className="text-red-700">*</span>
          <Input defaultValue={initial?.fechaVencimiento ?? ""} name="fechaVencimiento" required type="date" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Tipo de revestimiento <span className="text-red-700">*</span>
          <select
            className={selectClass}
            defaultValue={initial?.tipoRevestimiento ?? "revestimiento"}
            name="tipoRevestimiento"
            required
          >
            {Object.entries(serviceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Alcance del trabajo <span className="text-red-700">*</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={initial?.alcance ?? ""}
            maxLength={10000}
            name="alcance"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Superficie estimada <span className="text-red-700">*</span>
          <Input
            defaultValue={initial?.superficie ?? ""}
            min="0.01"
            name="superficie"
            required
            step="0.01"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Unidad <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.unidadSuperficie ?? "m2"} name="unidadSuperficie" required>
            {Object.entries(quoteSurfaceUnitLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Precio total bruto (CLP, incluye IVA) <span className="text-red-700">*</span>
          <Input defaultValue={initial?.precioTotal ?? ""} min="0" name="precioTotal" required step="1" type="number" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Costo estimado bruto (CLP, incluye IVA) <span className="text-red-700">*</span>
          <Input defaultValue={initial?.costoEstimado ?? ""} min="0" name="costoEstimado" required step="1" type="number" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Anticipo requerido (CLP) <span className="text-red-700">*</span>
          <Input defaultValue={initial?.anticipoRequerido ?? ""} min="0" name="anticipoRequerido" required step="1" type="number" />
          <span className="block text-xs font-normal text-slate-600">Condición comercial; no registra dinero recibido.</span>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Plazo estimado (días hábiles) <span className="text-red-700">*</span>
          <Input defaultValue={initial?.plazoDiasHabiles ?? 1} max="365" min="1" name="plazoDiasHabiles" required step="1" type="number" />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Condiciones <span className="text-red-700">*</span>
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={initial?.condiciones ?? ""}
            maxLength={10000}
            name="condiciones"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Exclusiones
          <textarea
            className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={initial?.exclusiones ?? ""}
            maxLength={10000}
            name="exclusiones"
          />
        </label>
      </div>
      <p className="text-xs text-slate-600">
        El margen estimado bruto se calcula en servidor como precio menos costo. Es una estimación comercial, no utilidad neta contable.
      </p>
      <ActionFeedback error={state.error} message={state.message} />
      <SubmitButton>{initial?.id ? "Guardar borrador" : "Crear borrador"}</SubmitButton>
    </form>
  );
}
