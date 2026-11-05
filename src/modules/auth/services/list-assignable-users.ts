import "server-only";
import { getPrismaClient } from "@/server/db/prisma";

export async function listAssignableUsers() {
  return getPrismaClient().user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      roles: { select: { role: true } },
    },
  });
}
