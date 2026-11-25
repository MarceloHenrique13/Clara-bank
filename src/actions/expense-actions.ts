"use server";

import { getPrismaClient } from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { getCurrentAppUser } from "./user-actions";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/expense-categories";
import {
  getOpenStatementCycle,
  isValidCycleDay,
  formatCycleDayLabel,
  parseLocalDateInput,
  resolveStatementTransactionDate,
  type StatementCycleChoice,
} from "@/lib/credit-card-cycle";

async function getActiveFamilyId(): Promise<string | null> {
  const appUser = await getCurrentAppUser();
  if (!appUser || !appUser.familyMemberships.length) {
    return null;
  }
  return appUser.familyMemberships[0].familyId;
}

export type ExpenseCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type AccountOption = {
  id: string;
  name: string;
  type: string;
  currency: string;
  color: string | null;
  statementClosingDay?: number | null;
  paymentDueDay?: number | null;
};

/** Ensure BR expense (+ income) categories exist for the family. */
export async function ensureDefaultExpenseCategories(familyId: string) {
  const prisma = getPrismaClient();
  try {
    const defaults = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    await Promise.all(
      defaults.map((cat) =>
        prisma.category.upsert({
          where: {
            familyId_name: {
              familyId,
              name: cat.name,
            },
          },
          update: {
            icon: cat.icon,
            color: cat.color,
            isActive: true,
          },
          create: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            familyId,
          },
        })
      )
    );
  } finally {
    // shared client — do not disconnect
  }
}

export async function getExpenseFormData(entryType: "expense" | "income" = "expense"): Promise<{
  categories: ExpenseCategoryOption[];
  accounts: AccountOption[];
}> {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return { categories: [], accounts: [] };
  }

  await ensureDefaultExpenseCategories(familyId);

  const prisma = getPrismaClient();
  try {
    const catalog =
      entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const names = catalog.map((c) => c.name);
    const [categories, accounts] = await Promise.all([
      prisma.category.findMany({
        where: {
          familyId,
          isActive: true,
          name: { in: names },
        },
        select: { id: true, name: true, icon: true, color: true },
        orderBy: { name: "asc" },
      }),
      prisma.financialAccount.findMany({
        where: { familyId, isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          currency: true,
          color: true,
          statementClosingDay: true,
          paymentDueDay: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const ordered = catalog
      .map((def) => categories.find((c) => c.name === def.name))
      .filter(Boolean) as ExpenseCategoryOption[];

    return { categories: ordered, accounts };
  } catch (error) {
    console.error("Error loading expense form data:", error);
    return { categories: [], accounts: [] };
  } finally {
    // shared client — do not disconnect
  }
}

/** @deprecated Prefer createMoneyEntry */
export async function createExpense(input: {
  amountCents: number;
  categoryId: string;
  accountId: string;
  note?: string;
}) {
  return createMoneyEntry({ ...input, type: "expense" });
}

export async function createMoneyEntry(input: {
  amountCents: number;
  categoryId: string;
  accountId: string;
  note?: string;
  type: "expense" | "income" | "card_expense";
  /** YYYY-MM-DD or ISO; defaults to today */
  date?: string;
  /** Expense/income only — tag as recurring/fixed */
  isFixed?: boolean;
  /** card_expense — which statement cycle the charge belongs to */
  statementCycle?: StatementCycleChoice;
  /** card_expense — total installments 1–12 (1 = à vista). Full amount hits the card now. */
  installments?: number;
}) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return { ok: false as const, error: "Família não encontrada" };
  }

  if (!input.amountCents || input.amountCents <= 0) {
    return { ok: false as const, error: "Digite um valor" };
  }
  if (!input.categoryId) {
    return { ok: false as const, error: "Escolha uma categoria" };
  }
  if (!input.accountId) {
    return { ok: false as const, error: "Escolha uma conta" };
  }

  const installments =
    input.type === "card_expense" &&
    typeof input.installments === "number" &&
    Number.isInteger(input.installments)
      ? Math.min(12, Math.max(1, input.installments))
      : 1;

  const prisma = getPrismaClient();
  const isExpense = input.type !== "income";
  const absolute = input.amountCents / 100;
  const amount = isExpense ? -absolute : absolute;
  const note = input.note?.trim() || "";
  const merchant =
    note ||
    (input.type === "card_expense"
      ? "Gasto no cartão"
      : isExpense
        ? "Gasto"
        : "Receita");

  try {
    const [account, category] = await Promise.all([
      prisma.financialAccount.findFirst({
        where: { id: input.accountId, familyId, isActive: true },
      }),
      prisma.category.findFirst({
        where: { id: input.categoryId, familyId, isActive: true },
      }),
    ]);

    if (!account) {
      return { ok: false as const, error: "Conta inválida" };
    }
    if (input.type === "card_expense" && account.type !== "CREDIT_CARD") {
      return { ok: false as const, error: "Selecione um cartão de crédito" };
    }
    if (
      input.type === "expense" &&
      account.type === "CREDIT_CARD"
    ) {
      return {
        ok: false as const,
        error: "Use Gastos cartão para lançar no cartão de crédito",
      };
    }
    if (!category) {
      return { ok: false as const, error: "Categoria inválida" };
    }

    const purchaseDate = parseLocalDateInput(input.date);
    let transactionDate = purchaseDate;

    const tags: string[] = [];

    if (
      (input.type === "expense" || input.type === "income") &&
      input.isFixed
    ) {
      tags.push("fixed");
    }

    if (input.type === "card_expense") {
      const statementCycle: StatementCycleChoice =
        input.statementCycle === "next" ? "next" : "current";
      tags.push(`statement:${statementCycle}`);

      if (
        isValidCycleDay(account.statementClosingDay) &&
        isValidCycleDay(account.paymentDueDay)
      ) {
        transactionDate = resolveStatementTransactionDate(
          purchaseDate,
          statementCycle,
          {
            statementClosingDay: account.statementClosingDay,
            paymentDueDay: account.paymentDueDay,
          }
        );
      }

      if (installments > 1) {
        // Full purchase amount on the card now (typical BR credit UX);
        // tag records parcel count for display (e.g. parcelas:3x).
        tags.push(`parcelas:${installments}x`);
      } else {
        tags.push("parcelas:1x");
      }
    }

    const installmentNote =
      input.type === "card_expense" && installments > 1
        ? `${installments}x de ${(absolute / installments).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`
        : null;

    const notesParts = [note || null, installmentNote].filter(Boolean);
    const descriptionBase = note || category.name;
    const description =
      installmentNote && note
        ? `${note} (${installments}x)`
        : installmentNote && !note
          ? `${category.name} (${installments}x)`
          : descriptionBase;

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          date: transactionDate,
          description,
          merchant,
          amount,
          type: isExpense ? "EXPENSE" : "INCOME",
          status: "RECONCILED",
          notes: notesParts.length ? notesParts.join(" · ") : null,
          tags,
          isReconciled: true,
          accountId: account.id,
          categoryId: category.id,
          familyId,
        },
      });

      await tx.financialAccount.update({
        where: { id: account.id },
        data: {
          balance: isExpense
            ? { decrement: absolute }
            : { increment: absolute },
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/financial");
    revalidatePath(`/dashboard/financial/${account.id}`);

    return {
      ok: true as const,
      categoryName: category.name,
      amount: absolute,
      type: input.type,
    };
  } catch (error) {
    console.error("Error creating money entry:", error);
    return {
      ok: false as const,
      error: isExpense
        ? "Não foi possível salvar o gasto"
        : "Não foi possível salvar a receita",
    };
  } finally {
    // shared client — do not disconnect
  }
}

export async function createTransfer(input: {
  amountCents: number;
  fromAccountId: string;
  toAccountId: string;
  note?: string;
  /** YYYY-MM-DD or ISO; defaults to today */
  date?: string;
}) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return { ok: false as const, error: "Família não encontrada" };
  }

  if (!input.amountCents || input.amountCents <= 0) {
    return { ok: false as const, error: "Digite um valor" };
  }
  if (!input.fromAccountId || !input.toAccountId) {
    return { ok: false as const, error: "Escolha as contas" };
  }
  if (input.fromAccountId === input.toAccountId) {
    return {
      ok: false as const,
      error: "Origem e destino precisam ser contas diferentes",
    };
  }

  const prisma = getPrismaClient();
  const absolute = input.amountCents / 100;
  const note = input.note?.trim() || "";
  const transactionDate = parseLocalDateInput(input.date);

  try {
    const [fromAccount, toAccount] = await Promise.all([
      prisma.financialAccount.findFirst({
        where: { id: input.fromAccountId, familyId, isActive: true },
      }),
      prisma.financialAccount.findFirst({
        where: { id: input.toAccountId, familyId, isActive: true },
      }),
    ]);

    if (!fromAccount) {
      return { ok: false as const, error: "Conta de origem inválida" };
    }
    if (!toAccount) {
      return { ok: false as const, error: "Conta de destino inválida" };
    }

    const description =
      note || `Transferência para ${toAccount.name}`;

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          date: transactionDate,
          description,
          merchant: note || "Transferência",
          amount: -absolute,
          type: "TRANSFER",
          status: "RECONCILED",
          notes: note || null,
          tags: [],
          isReconciled: true,
          accountId: fromAccount.id,
          transferToAccountId: toAccount.id,
          categoryId: null,
          familyId,
        },
      });

      await tx.financialAccount.update({
        where: { id: fromAccount.id },
        data: { balance: { decrement: absolute } },
      });

      await tx.financialAccount.update({
        where: { id: toAccount.id },
        data: { balance: { increment: absolute } },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/financial");
    revalidatePath(`/dashboard/financial/${fromAccount.id}`);
    revalidatePath(`/dashboard/financial/${toAccount.id}`);

    return {
      ok: true as const,
      amount: absolute,
      fromAccountName: fromAccount.name,
      toAccountName: toAccount.name,
    };
  } catch (error) {
    console.error("Error creating transfer:", error);
    return {
      ok: false as const,
      error: "Não foi possível salvar a transferência",
    };
  } finally {
    // shared client — do not disconnect
  }
}

export async function updateCreditCardCycle(input: {
  accountId: string;
  statementClosingDay: number;
  paymentDueDay: number;
}) {
  const familyId = await getActiveFamilyId();
  if (!familyId) {
    return { ok: false as const, error: "Família não encontrada" };
  }

  if (
    !isValidCycleDay(input.statementClosingDay) ||
    !isValidCycleDay(input.paymentDueDay)
  ) {
    return {
      ok: false as const,
      error: "Use dias entre 1 e 28",
    };
  }

  const prisma = getPrismaClient();
  try {
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: input.accountId,
        familyId,
        isActive: true,
        type: "CREDIT_CARD",
      },
    });

    if (!account) {
      return { ok: false as const, error: "Cartão não encontrado" };
    }

    await prisma.financialAccount.update({
      where: { id: account.id },
      data: {
        statementClosingDay: input.statementClosingDay,
        paymentDueDay: input.paymentDueDay,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/financial");
    revalidatePath(`/dashboard/financial/${account.id}`);

    return { ok: true as const };
  } catch (error) {
    console.error("Error updating credit card cycle:", error);
    return { ok: false as const, error: "Não foi possível salvar o ciclo" };
  } finally {
    // shared client — do not disconnect
  }
}

export type MobileHomeAccount = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution: string | null;
  color: string | null;
  accountNumber: string | null;
};

export type MobileHomeInvoice = {
  accountId: string;
  name: string;
  color: string | null;
  openAmount: number;
  currency: string;
  closesLabel: string;
  dueLabel: string;
  periodStart: string;
  periodEnd: string;
};

export type MobileHomeCategorySlice = {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  amount: number;
};

export async function getMobileHomeData(): Promise<{
  accounts: MobileHomeAccount[];
  openInvoices: MobileHomeInvoice[];
  categoryBreakdown: MobileHomeCategorySlice[];
  monthExpenseTotal: number;
}> {
  const empty = {
    accounts: [] as MobileHomeAccount[],
    openInvoices: [] as MobileHomeInvoice[],
    categoryBreakdown: [] as MobileHomeCategorySlice[],
    monthExpenseTotal: 0,
  };

  const familyId = await getActiveFamilyId();
  if (!familyId) return empty;

  const prisma = getPrismaClient();
  const now = new Date();

  try {
    // Seed categories only when the family has none (avoid upsert storm on every home load)
    const categoryCount = await prisma.category.count({ where: { familyId } });
    if (categoryCount === 0) {
      await ensureDefaultExpenseCategories(familyId);
    }

    const accounts = await prisma.financialAccount.findMany({
      where: { familyId, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
        currency: true,
        institution: true,
        color: true,
        accountNumber: true,
        statementClosingDay: true,
        paymentDueDay: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const mappedAccounts: MobileHomeAccount[] = accounts.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: Number(a.balance),
      currency: a.currency,
      institution: a.institution,
      color: a.color,
      accountNumber: a.accountNumber,
    }));

    const creditCards = accounts.filter(
      (a) =>
        a.type === "CREDIT_CARD" &&
        isValidCycleDay(a.statementClosingDay) &&
        isValidCycleDay(a.paymentDueDay)
    );

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const invoiceCycles = creditCards.map((card) => ({
      card,
      cycle: getOpenStatementCycle({
        statementClosingDay: card.statementClosingDay!,
        paymentDueDay: card.paymentDueDay!,
        now,
      }),
    }));

    const [invoiceAggs, monthExpenses] = await Promise.all([
      Promise.all(
        invoiceCycles.map(({ card, cycle }) =>
          prisma.transaction.aggregate({
            where: {
              familyId,
              accountId: card.id,
              type: "EXPENSE",
              date: {
                gte: cycle.periodStart,
                lt: cycle.periodEnd,
              },
            },
            _sum: { amount: true },
          })
        )
      ),
      prisma.transaction.findMany({
        where: {
          familyId,
          type: "EXPENSE",
          date: { gte: startOfMonth, lte: endOfMonth },
          categoryId: { not: null },
        },
        select: {
          amount: true,
          categoryId: true,
          category: {
            select: { id: true, name: true, icon: true, color: true },
          },
        },
      }),
    ]);

    const openInvoices: MobileHomeInvoice[] = invoiceCycles.map(
      ({ card, cycle }, index) => {
        const raw = Number(invoiceAggs[index]?._sum.amount ?? 0);
        return {
          accountId: card.id,
          name: card.name,
          color: card.color,
          openAmount: Math.abs(raw),
          currency: card.currency,
          closesLabel: formatCycleDayLabel(cycle.nextClosingDate),
          dueLabel: formatCycleDayLabel(cycle.dueDate),
          periodStart: cycle.periodStart.toISOString(),
          periodEnd: cycle.periodEnd.toISOString(),
        };
      }
    );

    const byCategory = new Map<
      string,
      MobileHomeCategorySlice
    >();

    for (const tx of monthExpenses) {
      if (!tx.category) continue;
      const amount = Math.abs(Number(tx.amount));
      const existing = byCategory.get(tx.category.id);
      if (existing) {
        existing.amount += amount;
      } else {
        byCategory.set(tx.category.id, {
          id: tx.category.id,
          name: tx.category.name,
          icon: tx.category.icon,
          color: tx.category.color || "#94A3B8",
          amount,
        });
      }
    }

    const categoryBreakdown = Array.from(byCategory.values()).sort(
      (a, b) => b.amount - a.amount
    );
    const monthExpenseTotal = categoryBreakdown.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    return {
      accounts: mappedAccounts,
      openInvoices,
      categoryBreakdown,
      monthExpenseTotal,
    };
  } catch (error) {
    console.error("Error loading mobile home data:", error);
    return empty;
  } finally {
    // shared client — do not disconnect
  }
}
