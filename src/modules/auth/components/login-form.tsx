"use client";

import { useActionState } from "react";
import { loginAction } from "@/modules/auth/actions";
import type { AuthFormState } from "@/modules/auth/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

const initialState: AuthFormState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <label className="block space-y-2 text-sm font-medium">
        Correo electrónico
        <Input autoComplete="email" name="email" required type="email" />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        Contraseña
        <Input
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p aria-live="polite" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
