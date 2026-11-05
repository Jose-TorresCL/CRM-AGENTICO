"use client";

import { useActionState } from "react";
import {
  requestPasswordRecoveryAction,
  updatePasswordAction,
} from "@/modules/auth/actions";
import type { AuthFormState } from "@/modules/auth/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const initialState: AuthFormState = {};

export function PasswordRecoveryForm({
  isUpdating,
}: {
  isUpdating: boolean;
}) {
  const [requestState, requestAction, requestPending] = useActionState(
    requestPasswordRecoveryAction,
    initialState,
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updatePasswordAction,
    initialState,
  );
  const state = isUpdating ? updateState : requestState;
  const action = isUpdating ? updateAction : requestAction;
  const pending = isUpdating ? updatePending : requestPending;

  return (
    <form action={action} className="space-y-5">
      {isUpdating ? (
        <>
          <label className="block space-y-2 text-sm font-medium">
            Nueva contraseña
            <Input autoComplete="new-password" name="password" required type="password" />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Confirmar contraseña
            <Input
              autoComplete="new-password"
              name="confirmPassword"
              required
              type="password"
            />
          </label>
        </>
      ) : (
        <label className="block space-y-2 text-sm font-medium">
          Correo electrónico
          <Input autoComplete="email" name="email" required type="email" />
        </label>
      )}
      {state.error ? (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p aria-live="polite" className="text-sm text-green-700">
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending
          ? "Procesando..."
          : isUpdating
            ? "Actualizar contraseña"
            : "Enviar enlace"}
      </Button>
    </form>
  );
}
