"use server";

import { revalidatePath } from "next/cache";
import {
  activityWriteRoles,
  requireRoles,
} from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import {
  activityInputSchema,
  cancelActivitySchema,
  completeActivitySchema,
  updateActivitySchema,
} from "./schemas/activity-schemas";
import {
  cancelActivity,
  completeActivity,
  editActivity,
  saveActivity,
} from "./services/activity-service";
import type { ActivityFormState } from "./types";

export async function createActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  try {
    const { user } = await requireRoles(activityWriteRoles);
    const values = Object.fromEntries(formData);
    const parsed = activityInputSchema.safeParse({
      ...values,
      responsableId: values.responsableId || user.id,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la actividad." };
    }

    await saveActivity(parsed.data);
    revalidateActivityViews();
    return { message: "Actividad creada correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function updateActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  try {
    const { user } = await requireRoles(activityWriteRoles);
    const values = Object.fromEntries(formData);
    const parsed = updateActivitySchema.safeParse({
      ...values,
      responsableId: values.responsableId || user.id,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la actividad." };
    }

    const { id, ...data } = parsed.data;
    await editActivity(id, data);
    revalidateActivityViews();
    return { message: "Actividad actualizada correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function completeActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  try {
    await requireRoles(activityWriteRoles);
    const parsed = completeActivitySchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Registra el resultado." };
    }

    await completeActivity(parsed.data);
    revalidateActivityViews();
    return { message: "Actividad completada." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function cancelActivityAction(
  _previousState: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  try {
    await requireRoles(activityWriteRoles);
    const parsed = cancelActivitySchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "No se pudo cancelar la actividad." };
    }

    await cancelActivity(parsed.data.id);
    revalidateActivityViews();
    return { message: "Actividad cancelada." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

function revalidateActivityViews() {
  revalidatePath("/actividades");
  revalidatePath("/clientes");
  revalidatePath("/oportunidades");
  revalidatePath("/pipeline");
  revalidatePath("/");
}
