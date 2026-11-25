import Link from "next/link";
import { getFinancialAccounts } from "@/actions/dashboard-actions";
import { createManualFinancialAccount } from "@/actions/financial-actions";
import { BANKS } from "@/data/banks";
import { redirect } from "next/navigation";

function formatMoney(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

function typeLabel(type: string) {
  switch (type) {
    case "CREDIT_CARD":
      return "Cartão";
    case "SAVINGS":
      return "Poupança";
    case "CHECKING":
      return "Corrente";
    default:
      return type;
  }
}

async function addAccount(formData: FormData) {
  "use server";
  const bankId = String(formData.get("bankId") || "");
  const accountType = String(formData.get("accountType") || "CHECKING");
  if (!bankId) return;

  const result = await createManualFinancialAccount({
    bankId,
    accountType: accountType as "CHECKING" | "SAVINGS" | "CREDIT_CARD",
  });

  if (result.ok) {
    redirect(`/dashboard/financial/${result.accountId}`);
  }
}

export default async function FinancialPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const selectedType =
    params.type === "CREDIT_CARD" ||
    params.type === "SAVINGS" ||
    params.type === "CHECKING"
      ? params.type
      : null;

  const accounts = await getFinancialAccounts();
  const banks = BANKS.slice(0, 16);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          SkibiriDin
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Contas</h1>
      </header>

      <section className="flex flex-col gap-3">
        {accounts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma conta ainda. Escolha o tipo e o banco abaixo.
          </p>
        ) : (
          accounts.map((account) => (
            <Link
              key={account.id}
              href={`/dashboard/financial/${account.id}`}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{account.name}</p>
                <p className="text-xs text-muted-foreground">
                  {typeLabel(account.type)}
                  {account.institution ? ` · ${account.institution}` : ""}
                </p>
              </div>
              <p
                className={`text-sm font-semibold tabular-nums ${
                  Number(account.balance) < 0 ? "text-rose-600" : ""
                }`}
              >
                {formatMoney(Number(account.balance), account.currency)}
              </p>
            </Link>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Adicionar
        </h2>

        {!selectedType ? (
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/dashboard/financial?type=CHECKING"
              className="pressable rounded-2xl border border-border/60 bg-card px-4 py-4 text-left"
            >
              <p className="font-medium">Conta corrente</p>
              <p className="text-xs text-muted-foreground">
                Saldo e gastos do dia a dia
              </p>
            </Link>
            <Link
              href="/dashboard/financial?type=CREDIT_CARD"
              className="pressable rounded-2xl border border-border/60 bg-card px-4 py-4 text-left"
            >
              <p className="font-medium">Cartão de crédito</p>
              <p className="text-xs text-muted-foreground">
                Fatura, fechamento e vencimento
              </p>
            </Link>
            <Link
              href="/dashboard/financial?type=SAVINGS"
              className="pressable rounded-2xl border border-border/60 bg-card px-4 py-4 text-left"
            >
              <p className="font-medium">Poupança</p>
              <p className="text-xs text-muted-foreground">
                Reserva e objetivos
              </p>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Banco para {typeLabel(selectedType).toLowerCase()}
              </p>
              <Link
                href="/dashboard/financial"
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Trocar tipo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {banks.map((bank) => (
                <form key={bank.id} action={addAccount}>
                  <input type="hidden" name="bankId" value={bank.id} />
                  <input type="hidden" name="accountType" value={selectedType} />
                  <button
                    type="submit"
                    className="pressable w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-left text-sm font-medium"
                  >
                    {bank.displayName}
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
