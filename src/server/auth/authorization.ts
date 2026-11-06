import "server-only";
import type { UserRole } from "@/generated/prisma/enums";
import { getAuthenticatedUser } from "@/server/auth/session";
import { AppError } from "@/server/errors/app-error";
import { getUserRoles } from "@/modules/auth/services/get-user-roles";

export async function requireRoles(allowedRoles: readonly UserRole[]) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AppError("Debes iniciar sesión para continuar.", 401);
  }

  const roles = await getUserRoles(user.id);
  const hasPermission = roles.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    throw new AppError("No tienes permisos para realizar esta acción.", 403);
  }

  return { user, roles };
}

export function hasAnyRole(
  roles: readonly UserRole[],
  allowedRoles: readonly UserRole[],
) {
  return roles.some((role) => allowedRoles.includes(role));
}

export const clientReadRoles = [
  "owner",
  "sales",
  "operations",
  "finance",
  "viewer",
] as const satisfies readonly UserRole[];

export const clientWriteRoles = ["owner", "sales"] as const satisfies readonly UserRole[];

export const opportunityReadRoles = clientReadRoles;
export const opportunityWriteRoles = clientWriteRoles;

export const quoteReadRoles = [
  ...clientReadRoles,
  "crew_leader",
] as const satisfies readonly UserRole[];
export const quoteWriteRoles = ["owner", "sales"] as const satisfies readonly UserRole[];

export const workReadRoles = quoteReadRoles;

export const activityReadRoles = clientReadRoles;
export const activityWriteRoles = [
  "owner",
  "sales",
  "operations",
  "finance",
] as const satisfies readonly UserRole[];
