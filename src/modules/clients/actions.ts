"use server";

import { revalidatePath } from "next/cache";
import { clientWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import { clientInputSchema, updateClientSchema } from "./schemas/client-schemas";
import { editClient, saveClient } from "./services/client-service";
import type { ClientFormState } from "./types";

export async function createClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  try {
    await requireRoles(clientWriteRoles);
    const parsed = clientInputSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del cliente." };
    }

    await saveClient(parsed.data);
    revalidatePath("/clientes");
    revalidatePath("/");
    return { message: "Cliente creado correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function updateClientAction(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  try {
    await requireRoles(clientWriteRoles);
    const parsed = updateClientSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del cliente." };
    }

    const { id, ...data } = parsed.data;
    await editClient(id, data);
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    revalidatePath("/");
    return { message: "Cliente actualizado correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}
