"use server";

import { redirect } from "next/navigation";
import { getPublicEnv } from "@/shared/lib/env";
import { getSupabaseServerClient } from "@/server/auth/supabase";
import { AppError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import type { AuthFormState } from "./types";
import {
  loginSchema,
  recoveryRequestSchema,
  updatePasswordSchema,
} from "./schemas/auth-schemas";

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Ingresa un correo válido y una contraseña." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    logger.error("Supabase sign-in failed", error);
    return { error: "No se pudo iniciar sesión. Revisa tus credenciales." };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error("Supabase sign-out failed", error);
    throw new AppError("No se pudo cerrar la sesión.");
  }

  redirect("/login");
}

export async function requestPasswordRecoveryAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = recoveryRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: "Ingresa un correo válido." };
  }

  const supabase = await getSupabaseServerClient();
  const appUrl = getPublicEnv().appUrl;
  const callbackUrl = new URL("/auth/callback", appUrl);
  callbackUrl.searchParams.set("next", "/recuperar-clave?mode=update");

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: callbackUrl.toString(),
  });

  if (error) {
    logger.error("Supabase password recovery request failed", error);
    return { error: "No se pudo enviar el enlace de recuperación." };
  }

  return {
    message: "Si el correo está registrado, recibirás un enlace para continuar.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Revisa los datos ingresados e inténtalo nuevamente.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    logger.error("Supabase password update failed", error);
    return { error: "No se pudo actualizar la contraseña. Solicita un enlace nuevo." };
  }

  redirect("/login");
}
