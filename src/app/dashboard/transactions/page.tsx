import { getTransactions } from "@/actions/dashboard-actions";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default async function TransactionsPage() {
  const transactions = await getTransactions({ limit: 40 });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          SkibiriDin
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Gastos</h1>
      </header>

      <section className="flex flex-col gap-2">
        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum lançamento ainda. Use o + para registrar.
          </p>
        ) : (
          transactions.map((tx) => {
            const amount = Number(tx.amount);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {tx.merchant || tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(new Date(tx.date))}
                    {tx.category?.name ? ` · ${tx.category.name}` : ""}
                    {tx.account?.name ? ` · ${tx.account.name}` : ""}
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    amount < 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {formatMoney(amount)}
                </p>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
