import { z } from "zod";

const serviceTypes = ["revestimiento", "reparacion", "mantencion", "otro"] as const;
const quoteStatuses = [
  "borrador",
  "enviada",
  "aprobada",
  "rechazada",
  "vencida",
  "anulada",
] as const;

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );
const positiveSurface = z.coerce.number().finite().gt(0).max(99999999.99);
const amount = z.coerce.number().int().min(0).max(99999999999999);
const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Indica una fecha válida.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Indica una fecha válida.")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const quoteFields = z
  .object({
    fechaVencimiento: dateOnly,
    alcance: requiredText(10000),
    tipoRevestimiento: z.enum(serviceTypes),
    superficie: positiveSurface,
    unidadSuperficie: z.enum(["m2", "unidad"]),
    precioTotal: amount,
    costoEstimado: amount,
    anticipoRequerido: amount,
    plazoDiasHabiles: z.coerce.number().int().min(1).max(365),
    condiciones: requiredText(10000),
    exclusiones: optionalText(10000),
  })
  .superRefine((values, context) => {
    if (values.anticipoRequerido > values.precioTotal) {
      context.addIssue({
        code: "custom",
        path: ["anticipoRequerido"],
        message: "El anticipo requerido no puede superar el precio total.",
      });
    }
  });

export const createQuoteSchema = quoteFields.extend({
  oportunidadId: z.uuid(),
});

export const updateQuoteSchema = quoteFields.extend({
  id: z.uuid(),
});

export const quoteFiltersSchema = z.object({
  search: optionalText(120),
  estado: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(quoteStatuses).optional(),
  ),
});

export const quoteIdSchema = z.object({ id: z.uuid() });

export const rejectQuoteSchema = z.object({
  id: z.uuid(),
  motivo: requiredText(1000),
});

export const annulQuoteSchema = z.object({
  id: z.uuid(),
  motivo: requiredText(1000),
});

export const convertQuoteToWorkSchema = z.object({
  id: z.uuid(),
  direccion: requiredText(240),
  comuna: requiredText(120),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type QuoteFilters = z.infer<typeof quoteFiltersSchema>;
