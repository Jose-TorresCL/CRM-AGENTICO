import { z } from "zod";

const clientTypes = ["persona_natural", "empresa", "condominio", "otro"] as const;
const clientStatuses = ["activo", "inactivo", "bloqueado"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.email().trim().max(254).optional(),
);

export const clientInputSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre del cliente.").max(160),
  telefono: optionalText(40),
  whatsapp: optionalText(40),
  email: optionalEmail,
  comuna: optionalText(120),
  direccion: optionalText(240),
  tipoCliente: z.enum(clientTypes),
  estado: z.enum(clientStatuses).default("activo"),
  notas: optionalText(5000),
});

export const updateClientSchema = clientInputSchema.extend({
  id: z.uuid(),
});

export const clientFiltersSchema = z.object({
  search: optionalText(120),
  estado: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(clientStatuses).optional(),
  ),
  tipoCliente: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(clientTypes).optional(),
  ),
  comuna: optionalText(120),
});

export const clientIdSchema = z.object({ id: z.uuid() });

export type ClientInput = z.infer<typeof clientInputSchema>;
