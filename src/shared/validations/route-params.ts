import { z } from "zod";
import { AppError } from "@/server/errors/app-error";

const uuidSchema = z.uuid();

export function parseRouteId(value: string) {
  const parsed = uuidSchema.safeParse(value);

  if (!parsed.success) {
    throw new AppError("El identificador no es válido.", 400);
  }

  return parsed.data;
}
