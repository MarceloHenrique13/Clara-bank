import { PrismaClient } from "@/generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

export function isAccelerateDatabaseUrl(
  url: string | undefined = process.env.DATABASE_URL,
): boolean {
  return (
    url?.startsWith("prisma://") === true ||
    url?.startsWith("prisma+postgres://") === true
  );
}

/**
 * Prisma client for the active `DATABASE_URL`.
 *
 * - `postgresql://…` (Neon, local Postgres): bundled query engine (default).
 * - `prisma://` / `prisma+postgres://`: Prisma Accelerate / Data Proxy URL;
 *   applies the Accelerate extension when present.
 */
export function createPrismaClient(): PrismaClient {
  const client = new PrismaClient();
  if (isAccelerateDatabaseUrl()) {
    return client.$extends(withAccelerate()) as unknown as PrismaClient;
  }
  return client;
}

/** Per-request client (same pattern as server actions). */
export function getPrismaClient(): PrismaClient {
  return createPrismaClient();
}
