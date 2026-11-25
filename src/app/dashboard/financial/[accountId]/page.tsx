import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getFinancialAccountById } from "@/actions/financial-actions";
import { deactivateFinancialAccount } from "@/actions/financial-actions";
import { getTransactions } from "@/actions/dashboard-actions";
import { CreditCardCycleForm } from "@/components/financial/credit-card-cycle-form";

function formatMoney(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function typeLabel(type: string) {
  switch (type) {
    case "CREDIT_CARD":
      return "Cartão de crédito";
    case "SAVINGS":
      return "Poupança";
    case "CHECKING":
      return "Conta corrente";
    default:
      return type;
  }
}

async function removeAccount(formData: FormData) {
  "use server";
  const accountId = String(formData.get("accountId") || "");
  if (!accountId) return;
  await deactivateFinancialAccount(accountId);
  redirect("/dashboard/financial");
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const account = await getFinancialAccountById(accountId);

  if (!account) {
    notFound();
  }

  const transactions = await getTransactions({
    accountId,
    limit: 20,
  });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div>
        <Link
          href="/dashboard/financial"
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          ← Contas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {account.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {typeLabel(account.type)}
          {account.institution ? ` · ${account.institution}` : ""}
        </p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card px-4 py-4">
        <p className="text-xs text-muted-foreground">
          {account.type === "CREDIT_CARD" ? "Fatura / saldo" : "Saldo"}
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatMoney(Number(account.balance), account.currency)}
        </p>
      </section>

      {account.type === "CREDIT_CARD" && (
        <CreditCardCycleForm
          accountId={account.id}
          statementClosingDay={account.statementClosingDay}
          paymentDueDay={account.paymentDueDay}
        />
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Lançamentos
          </h2>
          <Link
            href={`/dashboard/expense/new?accountId=${account.id}${
              account.type === "CREDIT_CARD" ? "&type=card_expense" : ""
            }`}
            className="text-xs font-medium text-brand underline-offset-2 hover:underline"
          >
            Novo lançamento
          </Link>
        </div>

        {transactions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            Nada lançado nesta conta ainda.
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
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold tabular-nums ${
                    amount < 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {formatMoney(amount, account.currency)}
                </p>
              </div>
            );
          })
        )}
      </section>

      <form action={removeAccount}>
        <input type="hidden" name="accountId" value={account.id} />
        <button
          type="submit"
          className="w-full rounded-xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600"
        >
          Remover conta
        </button>
      </form>
    </div>
  );
}
