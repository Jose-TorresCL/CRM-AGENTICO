"use client";

import { useActionState } from "react";
import { createClientAction, updateClientAction } from "../actions";
import type { ClientFormState } from "../types";
import { clientStatusLabels, clientTypeLabels } from "@/shared/constants/crm-labels";
import { ActionFeedback } from "@/shared/components/action-feedback";
import { SubmitButton } from "@/shared/components/submit-button";
import { Input } from "@/shared/components/ui/input";
import type { ClientStatus, ClientType } from "@/generated/prisma/enums";

type ClientFormValues = {
  id?: string;
  nombre?: string;
  telefono?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  comuna?: string | null;
  direccion?: string | null;
  tipoCliente?: ClientType;
  estado?: ClientStatus;
  notas?: string | null;
};

const initialState: ClientFormState = {};
const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";

export function ClientForm({ initial }: { initial?: ClientFormValues }) {
  const actionFunction = initial?.id ? updateClientAction : createClientAction;
  const [state, action] = useActionState(actionFunction, initialState);

  return (
    <form action={action} className="space-y-5">
      {initial?.id ? <input name="id" type="hidden" value={initial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          Nombre <span className="text-red-700">*</span>
          <Input defaultValue={initial?.nombre ?? ""} maxLength={160} name="nombre" required />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Tipo de cliente <span className="text-red-700">*</span>
          <select
            className={selectClass}
            defaultValue={initial?.tipoCliente ?? "persona_natural"}
            name="tipoCliente"
            required
          >
            {Object.entries(clientTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Teléfono
          <Input defaultValue={initial?.telefono ?? ""} maxLength={40} name="telefono" type="tel" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          WhatsApp
          <Input defaultValue={initial?.whatsapp ?? ""} maxLength={40} name="whatsapp" type="tel" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Correo electrónico
          <Input defaultValue={initial?.email ?? ""} maxLength={254} name="email" type="email" />
        </label>
        <label className="space-y-2 text-sm font-medium">
          Comuna
          <Input defaultValue={initial?.comuna ?? ""} maxLength={120} name="comuna" />
        </label>
        <label className="space-y-2 text-sm font-medium sm:col-span-2">
          Dirección
          <Input defaultValue={initial?.direccion ?? ""} maxLength={240} name="direccion" />
        </label>
        {initial?.id ? (
          <label className="space-y-2 text-sm font-medium">
            Estado
            <select className={selectClass} defaultValue={initial.estado ?? "activo"} name="estado">
              {Object.entries(clientStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        ) : null}
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
      <ActionFeedback error={state.error} message={state.message} />
      <SubmitButton>{initial?.id ? "Guardar cambios" : "Crear cliente"}</SubmitButton>
    </form>
  );
}
