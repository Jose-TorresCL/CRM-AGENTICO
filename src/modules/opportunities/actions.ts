"use server";

import { revalidatePath } from "next/cache";
import {
  opportunityWriteRoles,
  requireRoles,
} from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import {
  cancelOpportunitySchema,
  changeOpportunityStageSchema,
  opportunityInputSchema,
  updateOpportunitySchema,
} from "./schemas/opportunity-schemas";
import {
  cancelOpportunity,
  changeOpportunityStage,
  editOpportunity,
  saveOpportunity,
} from "./services/opportunity-service";
import type { OpportunityFormState } from "./types";

export async function createOpportunityAction(
  _previousState: OpportunityFormState,
  formData: FormData,
): Promise<OpportunityFormState> {
  try {
    const { user } = await requireRoles(opportunityWriteRoles);
    const values = Object.fromEntries(formData);
    const parsed = opportunityInputSchema.safeParse({
      ...values,
      responsableId: values.responsableId || user.id,
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Revisa los datos de la oportunidad.",
      };
    }

    await saveOpportunity(parsed.data);
    revalidatePath("/oportunidades");
    revalidatePath("/pipeline");
    revalidatePath("/");
    return { message: "Oportunidad creada correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function updateOpportunityAction(
  _previousState: OpportunityFormState,
  formData: FormData,
): Promise<OpportunityFormState> {
  try {
    const { user } = await requireRoles(opportunityWriteRoles);
    const values = Object.fromEntries(formData);
    const parsed = updateOpportunitySchema.safeParse({
      ...values,
      responsableId: values.responsableId || user.id,
    });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Revisa los datos de la oportunidad.",
      };
    }

    const { id, ...data } = parsed.data;
    await editOpportunity(id, data);
    revalidatePath("/oportunidades");
    revalidatePath(`/oportunidades/${id}`);
    revalidatePath("/pipeline");
    revalidatePath("/");
    return { message: "Oportunidad actualizada correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function changeOpportunityStageAction(
  _previousState: OpportunityFormState,
  formData: FormData,
): Promise<OpportunityFormState> {
  try {
    const { user, roles } = await requireRoles(opportunityWriteRoles);
    const parsed = changeOpportunityStageSchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "La etapa no es válida." };
    }

    await changeOpportunityStage(parsed.data, { id: user.id, roles });
    revalidateOpportunityViews(parsed.data.id);
    return { message: "Etapa actualizada correctamente." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

export async function cancelOpportunityAction(
  _previousState: OpportunityFormState,
  formData: FormData,
): Promise<OpportunityFormState> {
  try {
    await requireRoles(opportunityWriteRoles);
    const parsed = cancelOpportunitySchema.safeParse(
      Object.fromEntries(formData),
    );

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Indica el motivo de cancelación." };
    }

    await cancelOpportunity(parsed.data.id, parsed.data.motivoCancelacion);
    revalidateOpportunityViews(parsed.data.id);
    return { message: "Oportunidad cancelada." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }

    throw error;
  }
}

function revalidateOpportunityViews(id: string) {
  revalidatePath("/oportunidades");
  revalidatePath(`/oportunidades/${id}`);
  revalidatePath("/pipeline");
  revalidatePath("/");
}
