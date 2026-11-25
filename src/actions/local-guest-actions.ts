"use server";

import { getPrismaClient } from "@/lib/prisma";

import {
  LOCAL_GUEST_APP_USER_ID,
  LOCAL_GUEST_EMAIL,
  LOCAL_GUEST_FAMILY_ID,
  LOCAL_GUEST_USER_ID,
  isAuthRequired,
} from "@/lib/local-guest";

const appUserInclude = {
  familyMemberships: {
    include: {
      family: true,
    },
  },
} as const;

/**
 * Ensures a single local guest User → AppUser → Family exists when auth is optional.
 * Fast path: one read when already seeded (no write storm per request).
 */
export async function ensureLocalGuestAppUser() {
  if (isAuthRequired()) {
    return null;
  }

  const prisma = getPrismaClient();
  const now = new Date();

  try {
    const existing = await prisma.appUser.findUnique({
      where: { id: LOCAL_GUEST_APP_USER_ID },
      include: appUserInclude,
    });
    if (existing?.familyMemberships?.length) {
      return existing;
    }

    await prisma.user.upsert({
      where: { id: LOCAL_GUEST_USER_ID },
      create: {
        id: LOCAL_GUEST_USER_ID,
        email: LOCAL_GUEST_EMAIL,
        name: "Clara",
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
      update: {},
    });

    await prisma.appUser.upsert({
      where: { id: LOCAL_GUEST_APP_USER_ID },
      create: {
        id: LOCAL_GUEST_APP_USER_ID,
        userId: LOCAL_GUEST_USER_ID,
        firstName: "Clara",
        locale: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
      update: {},
    });

    await prisma.family.upsert({
      where: { id: LOCAL_GUEST_FAMILY_ID },
      create: {
        id: LOCAL_GUEST_FAMILY_ID,
        name: "Minhas finanças",
        description: "Modo local",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
      },
      update: {},
    });

    await prisma.familyMember.upsert({
      where: {
        familyId_appUserId: {
          familyId: LOCAL_GUEST_FAMILY_ID,
          appUserId: LOCAL_GUEST_APP_USER_ID,
        },
      },
      create: {
        familyId: LOCAL_GUEST_FAMILY_ID,
        appUserId: LOCAL_GUEST_APP_USER_ID,
        role: "OWNER",
      },
      update: {},
    });

    return prisma.appUser.findUnique({
      where: { id: LOCAL_GUEST_APP_USER_ID },
      include: appUserInclude,
    });
  } catch (error) {
    console.error("Error ensuring local guest user:", error);
    return null;
  }
}
