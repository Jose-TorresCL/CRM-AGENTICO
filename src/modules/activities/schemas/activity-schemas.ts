import { z } from "zod";
import { parseChileLocalDateTime } from "@/shared/lib/chile-datetime";

const activityTypes = [
  "llamada",
  "whatsapp",
  "visita_tecnica",
  "seguimiento",
  "coordinacion",
  "cobranza",
  "incidencia",
  "cambio_alcance",
  "otro",
] as const;
const activityStatuses = ["pendiente", "en_curso", "completada", "cancelada"] as const;
const activityPriorities = ["baja", "media", "alta", "critica"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const localDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ingresa una fecha y hora válidas.")
  .transform(parseChileLocalDateTime)
  .refine((value) => !Number.isNaN(value.getTime()), "La fecha y hora no son válidas.");

const activityFields = z.object({
  tipo: z.enum(activityTypes),
  asunto: z.string().trim().min(2, "Ingresa un asunto.").max(180),
  descripcion: optionalText(5000),
  fechaHora: localDateTimeSchema,
  responsableId: z.uuid(),
  prioridad: z.enum(activityPriorities),
  clienteId: z.uuid(),
  oportunidadId: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.uuid().optional(),
  ),
});

export const activityInputSchema = activityFields;
export const updateActivitySchema = activityFields.extend({ id: z.uuid() });

export const activityFiltersSchema = z.object({
  tipo: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(activityTypes).optional(),
  ),
  estado: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(activityStatuses).optional(),
  ),
  responsableId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  clienteId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  oportunidadId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.uuid().optional(),
  ),
  periodo: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["hoy", "vencidas"]).optional(),
  ),
});

export const completeActivitySchema = z.object({
  id: z.uuid(),
  resultado: z.string().trim().min(1, "Registra el resultado de la actividad.").max(3000),
});

export const cancelActivitySchema = z.object({
  id: z.uuid(),
});

export const activityIdSchema = z.object({
  id: z.uuid(),
  clienteId: z.uuid(),
});

export const updateActivityIdSchema = z.object({
  id: z.uuid(),
});

export type ActivityInput = z.infer<typeof activityInputSchema>;
