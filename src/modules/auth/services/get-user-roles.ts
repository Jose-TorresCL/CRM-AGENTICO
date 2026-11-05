import "server-only";
import { getPrismaClient } from "@/server/db/prisma";

export async function getUserRoles(userId: string) {
  const assignments = await getPrismaClient().userRoleAssignment.findMany({
    where: { userId },
    orderBy: { role: "asc" },
    select: { role: true },
  });

  return assignments.map(({ role }) => role);
}
