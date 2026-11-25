import Link from "next/link";
import {
  getTransactions,
  getFinancialAccounts,
} from "@/actions/dashboard-actions";
import { TransactionRow } from "@/components/mobile/transaction-row";

function monthBounds(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return null;
  return {
    start: new Date(y, m - 1, 1),
    end: new Date(y, m, 0, 23, 59, 59, 999),
  };
}

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ accountId?: string; month?: string }>;
}) {
  const params = await searchParams;
  const month = params.month || currentMonthValue();
  const bounds = monthBounds(month);
  const accountId = params.accountId || undefined;

  const [transactions, accounts] = await Promise.all([
    getTransactions({
      limit: 80,
      accountId,
      startDate: bounds?.start,
      endDate: bounds?.end,
    }),
    getFinancialAccounts(),
  ]);

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          SkibiriDin
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Gastos</h1>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {monthOptions.map((option) => {
            const href = `/dashboard/transactions?month=${option.value}${
              accountId ? `&accountId=${accountId}` : ""
            }`;
            const active = option.value === month;
            return (
              <Link
                key={option.value}
                href={href}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "border border-border/60 bg-card"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/transactions?month=${month}`}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              !accountId
                ? "bg-brand text-brand-foreground"
                : "border border-border/60 bg-card"
            }`}
          >
            Todas
          </Link>
          {accounts.map((account) => {
            const active = accountId === account.id;
            return (
              <Link
                key={account.id}
                href={`/dashboard/transactions?month=${month}&accountId=${account.id}`}
                className={`max-w-[10rem] truncate rounded-full px-3 py-1.5 text-xs font-medium ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "border border-border/60 bg-card"
                }`}
              >
                {account.name}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento neste filtro. Use o + para registrar.
          </p>
        ) : (
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </section>
    </div>
  );
}
