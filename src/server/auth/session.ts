import "server-only";
import { AppError } from "@/server/errors/app-error";
import { getSupabaseComponentClient } from "./supabase";

export async function getAuthenticatedUser() {
  const supabase = await getSupabaseComponentClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new AppError("No se pudo validar la sesión.", 401);
  }

  return data.user;
}
