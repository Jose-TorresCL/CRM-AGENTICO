import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnv } from "@/shared/lib/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

export function getPrismaClient() {
  if (!globalForPrisma.prismaClient) {
    const adapter = new PrismaPg({
      connectionString: getServerEnv().databaseUrl,
    });
    globalForPrisma.prismaClient = new PrismaClient({ adapter });
  }

  return globalForPrisma.prismaClient;
}
