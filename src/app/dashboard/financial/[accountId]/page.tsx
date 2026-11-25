import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getFinancialAccountById,
  deactivateFinancialAccount,
} from "@/actions/financial-actions";
import { getTransactions, getFinancialAccounts } from "@/actions/dashboard-actions";
import { getMobileHomeData } from "@/actions/expense-actions";
import { CreditCardCycleForm } from "@/components/financial/credit-card-cycle-form";
import { AccountEditForm } from "@/components/mobile/account-edit-form";
import { PayBillForm } from "@/components/mobile/pay-bill-form";
import { TransactionRow } from "@/components/mobile/transaction-row";

function formatMoney(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
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
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ pay?: string; edit?: string }>;
}) {
  const { accountId } = await params;
  const { pay, edit } = await searchParams;
  const account = await getFinancialAccountById(accountId);

  if (!account) {
    notFound();
  }

  const [transactions, accounts, home] = await Promise.all([
    getTransactions({ accountId, limit: 20 }),
    getFinancialAccounts(),
    account.type === "CREDIT_CARD" ? getMobileHomeData() : null,
  ]);

  const invoice = home?.openInvoices.find((item) => item.accountId === account.id);
  const openAmount = invoice?.openAmount ?? 0;
  const payFromAccounts = accounts.filter(
    (item) =>
      item.id !== account.id &&
      (item.type === "CHECKING" || item.type === "SAVINGS")
  );

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
          {account.type === "CREDIT_CARD" ? "Saldo do cartão" : "Saldo"}
        </p>
        <p
          className={`mt-1 text-3xl font-semibold tabular-nums ${
            Number(account.balance) < 0 ? "text-rose-600" : ""
          }`}
        >
          {formatMoney(Number(account.balance), account.currency)}
        </p>
        {account.type === "CREDIT_CARD" && (
          <div className="mt-4 border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground">Fatura em aberto</p>
            <p
              className={`mt-1 text-xl font-semibold tabular-nums ${
                openAmount > 0 ? "text-rose-600" : ""
              }`}
            >
              {formatMoney(openAmount, account.currency)}
            </p>
            {invoice && openAmount > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Fecha {invoice.closesLabel} · Vence {invoice.dueLabel}
              </p>
            )}
          </div>
        )}
      </section>

      <AccountEditForm
        accountId={account.id}
        name={account.name}
        balance={Number(account.balance)}
        defaultOpen={edit === "1"}
      />

      {account.type === "CREDIT_CARD" && (
        <>
          <CreditCardCycleForm
            accountId={account.id}
            statementClosingDay={account.statementClosingDay}
            paymentDueDay={account.paymentDueDay}
          />
          <div className={pay === "1" ? "ring-2 ring-brand/40 rounded-2xl" : ""}>
            <PayBillForm
              cardAccountId={account.id}
              openAmount={openAmount}
              payFromAccounts={payFromAccounts}
              defaultOpen={pay === "1"}
            />
          </div>
        </>
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
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
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
