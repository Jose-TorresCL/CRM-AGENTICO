"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { quoteWriteRoles, requireRoles } from "@/server/auth/authorization";
import { AppError } from "@/server/errors/app-error";
import {
  annulQuoteSchema,
  convertQuoteToWorkSchema,
  createQuoteSchema,
  quoteIdSchema,
  rejectQuoteSchema,
  updateQuoteSchema,
} from "./schemas/quote-schemas";
import {
  annulQuote,
  approveQuote,
  convertApprovedQuoteToWork,
  editQuote,
  expireQuote,
  rejectQuote,
  saveQuote,
  sendQuote,
} from "./services/quote-service";
import type { QuoteFormState } from "./types";

export async function createQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = createQuoteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cotización." };
    }

    const quote = await saveQuote(parsed.data, { id: user.id });
    revalidateQuoteViews(quote.id);
    redirect(`/cotizaciones/${quote.id}`);
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function updateQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = updateQuoteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cotización." };
    }

    await editQuote(parsed.data, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    return { message: "Borrador actualizado." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function sendQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = quoteIdSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: "La cotización indicada no es válida." };
    }

    const opportunityId = await sendQuote(parsed.data.id, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    revalidatePath(`/oportunidades/${opportunityId}`);
    return { message: "Envío registrado manualmente. No se envió ningún correo ni mensaje." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function approveQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  let quoteId: string | undefined;
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = quoteIdSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: "La cotización indicada no es válida." };
    }

    quoteId = parsed.data.id;
    const opportunityId = await approveQuote(parsed.data.id, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    revalidatePath(`/oportunidades/${opportunityId}`);
    return { message: "Cotización aprobada y oportunidad marcada como ganada." };
  } catch (error) {
    if (error instanceof AppError) {
      if (quoteId) {
        revalidateQuoteViews(quoteId);
      }
      return { error: error.message };
    }
    throw error;
  }
}

export async function rejectQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = rejectQuoteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Indica el motivo de rechazo." };
    }

    await rejectQuote(parsed.data.id, parsed.data.motivo, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    return { message: "Rechazo registrado. La oportunidad conserva su etapa." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function annulQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = annulQuoteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Indica el motivo de anulación." };
    }

    await annulQuote(parsed.data.id, parsed.data.motivo, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    return { message: "Cotización anulada." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function expireQuoteAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = quoteIdSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: "La cotización indicada no es válida." };
    }

    await expireQuote(parsed.data.id, { id: user.id });
    revalidateQuoteViews(parsed.data.id);
    return { message: "Cotización marcada como vencida." };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function convertQuoteToWorkAction(
  _previousState: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  try {
    const { user } = await requireRoles(quoteWriteRoles);
    const parsed = convertQuoteToWorkSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Confirma la dirección y comuna de la obra." };
    }

    const work = await convertApprovedQuoteToWork(
      parsed.data.id,
      parsed.data.direccion,
      parsed.data.comuna,
      { id: user.id },
    );
    revalidateQuoteViews(parsed.data.id);
    revalidatePath("/obras");
    revalidatePath(`/obras/${work.id}`);
    return { message: "Obra inicial creada desde la cotización.", workId: work.id };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message };
    }
    throw error;
  }
}

function revalidateQuoteViews(id: string) {
  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  revalidatePath("/oportunidades");
  revalidatePath("/pipeline");
  revalidatePath("/");
}
