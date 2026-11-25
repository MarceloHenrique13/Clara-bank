import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isAccelerateDatabaseUrl(
  url: string | undefined = process.env.DATABASE_URL,
): boolean {
  return (
    url?.startsWith("prisma://") === true ||
    url?.startsWith("prisma+postgres://") === true
  );
}

export function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
  if (isAccelerateDatabaseUrl()) {
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return client;
}

/** Shared Prisma client (avoids Neon connection churn per server action). */
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
