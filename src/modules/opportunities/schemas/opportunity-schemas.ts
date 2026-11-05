import { z } from "zod";
import { parseChileLocalDateTime } from "@/shared/lib/chile-datetime";

const opportunitySources = [
  "whatsapp",
  "telefono",
  "instagram",
  "google",
  "referido",
  "postventa",
  "otro",
] as const;
const serviceTypes = ["revestimiento", "reparacion", "mantencion", "otro"] as const;
const opportunityStages = [
  "nuevo",
  "contactado",
  "visita_agendada",
  "cotizado",
  "negociacion",
  "ganado",
  "perdido",
] as const;
const opportunityStatuses = ["abierta", "ganada", "perdida", "cancelada"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);

const optionalDateBoundary = (nextDay = false) =>
  z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .transform((value) => {
        const [yearText = "", monthText = "", dayText = ""] = value.split("-");
        if (!nextDay) {
          return parseChileLocalDateTime(`${value}T00:00`);
        }

        const nextDayDate = new Date(
          Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText) + 1),
        )
          .toISOString()
          .slice(0, 10);
        return parseChileLocalDateTime(`${nextDayDate}T00:00`);
      })
      .refine((value) => !Number.isNaN(value.getTime()))
      .optional(),
  );

const optionalLocalDateTime = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .transform(parseChileLocalDateTime)
    .refine((value) => !Number.isNaN(value.getTime()))
    .optional(),
);

const optionalAmount = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().nonnegative().optional(),
);

const opportunityFields = z.object({
  clienteId: z.uuid(),
  origen: z.enum(opportunitySources),
  tipoServicio: z.enum(serviceTypes),
  comuna: optionalText(120),
  valorEstimado: optionalAmount,
  fechaEstimadaCierre: optionalDate,
  responsableId: z.uuid(),
  proximaAccion: optionalText(500),
  fechaProximaAccion: optionalLocalDateTime,
  notas: optionalText(5000),
});

export const opportunityInputSchema = opportunityFields.refine(
  (value) => Boolean(value.proximaAccion || value.fechaProximaAccion),
  {
    path: ["proximaAccion"],
    message: "Indica una próxima acción o una fecha de seguimiento.",
  },
);

export const updateOpportunitySchema = opportunityFields.extend({
  id: z.uuid(),
});

export const opportunityFiltersSchema = z.object({
  search: optionalText(120),
  etapa: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(opportunityStages).optional(),
  ),
  origen: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(opportunitySources).optional(),
  ),
  responsableId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  comuna: optionalText(120),
  estado: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(opportunityStatuses).optional(),
  ),
  desde: optionalDateBoundary(),
  hasta: optionalDateBoundary(true),
});

export const changeOpportunityStageSchema = z.object({
  id: z.uuid(),
  etapa: z.enum(opportunityStages),
  motivoPerdida: optionalText(1000),
  motivoCancelacion: optionalText(1000),
  excepcionOwnerMotivo: optionalText(1000),
});

export const cancelOpportunitySchema = z.object({
  id: z.uuid(),
  motivoCancelacion: z.string().trim().min(1, "Indica el motivo de cancelación.").max(1000),
});

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;
