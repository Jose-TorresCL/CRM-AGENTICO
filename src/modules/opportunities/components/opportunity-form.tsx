"use client";

import { useActionState } from "react";
import type {
  OpportunitySource,
  ServiceType,
  OpportunityStatus,
  OpportunityStage,
} from "@/generated/prisma/enums";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { SubmitButton } from "@/shared/components/submit-button";
import { Input } from "@/shared/components/ui/input";
import {
  opportunitySourceLabels,
  opportunityStageLabels,
  opportunityStatusLabels,
  serviceTypeLabels,
} from "@/shared/constants/crm-labels";
import {
  createOpportunityAction,
  updateOpportunityAction,
} from "../actions";
import type { OpportunityFormState } from "../types";
import { formatChileLocalDateTime } from "@/shared/lib/chile-datetime";

type OpportunityFormValues = {
  id?: string;
  clienteId?: string;
  origen?: OpportunitySource;
  tipoServicio?: ServiceType;
  comuna?: string | null;
  valorEstimado?: number | string | null;
  fechaEstimadaCierre?: string | null;
  responsableId?: string;
  proximaAccion?: string | null;
  fechaProximaAccion?: Date | string | null;
  notas?: string | null;
  etapa?: OpportunityStage;
  estado?: OpportunityStatus;
};

type Option = { id: string; label: string };
const initialState: OpportunityFormState = {};
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export function OpportunityForm({
  clients,
  users,
  initialUserId,
  initial,
}: {
  clients: Option[];
  users: Option[];
  initialUserId: string;
  initial?: OpportunityFormValues;
}) {
  const actionFunction = initial?.id ? updateOpportunityAction : createOpportunityAction;
  const [state, action] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="space-y-5">
      {initial?.id ? <input name="id" type="hidden" value={initial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Cliente <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.clienteId ?? ""} name="clienteId" required>
            <option disabled value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Responsable (UUID) <span className="text-red-700">*</span>
          <select
            className={selectClass}
            defaultValue={initial?.responsableId ?? initialUserId}
            name="responsableId"
            required
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Origen <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.origen ?? "whatsapp"} name="origen" required>
            {Object.entries(opportunitySourceLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Tipo de servicio <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.tipoServicio ?? "revestimiento"} name="tipoServicio" required>
            {Object.entries(serviceTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Comuna
          <Input defaultValue={initial?.comuna ?? ""} maxLength={120} name="comuna" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Valor estimado
          <Input
            defaultValue={initial?.valorEstimado?.toString() ?? ""}
            min="0"
            name="valorEstimado"
            step="1"
            type="number"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Fecha estimada de cierre
          <Input defaultValue={initial?.fechaEstimadaCierre ?? ""} name="fechaEstimadaCierre" type="date" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Etapa actual
          <Input disabled value={initial ? opportunityStageLabels[initial.etapa ?? "nuevo"] : "Nuevo"} />
        </label>
        {initial?.id ? (
          <label className="space-y-2 text-sm font-medium">
            Estado actual
            <Input disabled value={opportunityStatusLabels[initial.estado ?? "abierta"]} />
          </label>
        ) : null}
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Próxima acción <span className="text-red-700">*</span>
          <Input defaultValue={initial?.proximaAccion ?? ""} maxLength={500} name="proximaAccion" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Fecha de seguimiento
          <Input
            defaultValue={
              initial?.fechaProximaAccion instanceof Date
                ? formatChileLocalDateTime(initial.fechaProximaAccion)
                : initial?.fechaProximaAccion ?? ""
            }
            name="fechaProximaAccion"
            type="datetime-local"
          />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Notas
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            defaultValue={initial?.notas ?? ""}
            maxLength={5000}
            name="notas"
          />
        </label>
      </div>
      <p className="text-xs text-slate-600">Elige un usuario por UUID; por defecto se asigna tu usuario actual.</p>
      <ActionFeedback error={state.error} message={state.message} />
      <SubmitButton>{initial?.id ? "Guardar cambios" : "Crear oportunidad"}</SubmitButton>
    </form>
  );
}
