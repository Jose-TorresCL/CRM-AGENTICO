"use client";

import { useActionState } from "react";
import type {
  ActivityPriority,
  ActivityType,
} from "@/generated/prisma/enums";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { SubmitButton } from "@/shared/components/submit-button";
import { Input } from "@/shared/components/ui/input";
import { activityPriorityLabels, activityTypeLabels } from "@/shared/constants/crm-labels";
import { formatChileLocalDateTime } from "@/shared/lib/chile-datetime";
import {
  createActivityAction,
  updateActivityAction,
} from "../actions";
import type { ActivityFormState } from "../types";

type ActivityFormValues = {
  id?: string;
  tipo?: ActivityType;
  asunto?: string;
  descripcion?: string | null;
  fechaHora?: Date;
  responsableId?: string;
  prioridad?: ActivityPriority;
  clienteId?: string;
  oportunidadId?: string | null;
};

type Option = { id: string; label: string };
const initialState: ActivityFormState = {};
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export function ActivityForm({
  clients,
  opportunities,
  users,
  initialUserId,
  initial,
  clientId,
  opportunityId,
}: {
  clients: Option[];
  opportunities: Option[];
  users: Option[];
  initialUserId: string;
  initial?: ActivityFormValues;
  clientId?: string;
  opportunityId?: string;
}) {
  const actionFunction = initial?.id ? updateActivityAction : createActivityAction;
  const [state, action] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="space-y-5">
      {initial?.id ? <input name="id" type="hidden" value={initial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Asunto <span className="text-red-700">*</span>
          <Input defaultValue={initial?.asunto ?? ""} maxLength={180} name="asunto" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Tipo <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.tipo ?? "seguimiento"} name="tipo" required>
            {Object.entries(activityTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Fecha y hora (Chile) <span className="text-red-700">*</span>
          <Input
            defaultValue={formatChileLocalDateTime(initial?.fechaHora)}
            name="fechaHora"
            required
            type="datetime-local"
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Prioridad
          <select className={selectClass} defaultValue={initial?.prioridad ?? "media"} name="prioridad">
            {Object.entries(activityPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Cliente <span className="text-red-700">*</span>
          <select className={selectClass} defaultValue={initial?.clienteId ?? clientId ?? ""} name="clienteId" required>
            <option disabled value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Oportunidad (opcional)
          <select className={selectClass} defaultValue={initial?.oportunidadId ?? opportunityId ?? ""} name="oportunidadId">
            <option value="">Sin oportunidad</option>
            {opportunities.map((opportunity) => (
              <option key={opportunity.id} value={opportunity.id}>{opportunity.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
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
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Descripción
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            defaultValue={initial?.descripcion ?? ""}
            maxLength={5000}
            name="descripcion"
          />
        </label>
      </div>
      <p className="text-xs text-slate-600">Elige un usuario por UUID; por defecto se asigna tu usuario actual. La oportunidad debe pertenecer al cliente elegido.</p>
      <ActionFeedback error={state.error} message={state.message} />
      <SubmitButton>{initial?.id ? "Guardar cambios" : "Crear actividad"}</SubmitButton>
    </form>
  );
}
