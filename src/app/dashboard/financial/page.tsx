import Link from "next/link";
import { getFinancialAccounts } from "@/actions/dashboard-actions";
import { createManualFinancialAccount } from "@/actions/financial-actions";
import { BANKS } from "@/data/banks";
import { revalidatePath } from "next/cache";

function formatMoney(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

async function addAccount(formData: FormData) {
  "use server";
  const bankId = String(formData.get("bankId") || "");
  if (!bankId) return;
  await createManualFinancialAccount({ bankId });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/financial");
}

export default async function FinancialPage() {
  const accounts = await getFinancialAccounts();
  const banks = BANKS.slice(0, 24);

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
            Nenhuma conta ainda. Adicione um banco abaixo.
          </p>
        ) : (
          accounts.map((account) => (
            <Link
              key={account.id}
              href={`/dashboard/financial/${account.id}`}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
            >
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-xs text-muted-foreground">
                  {account.institution || account.type}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">
                {formatMoney(Number(account.balance), account.currency)}
              </p>
            </Link>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Adicionar conta
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {banks.map((bank) => (
            <form key={bank.id} action={addAccount}>
              <input type="hidden" name="bankId" value={bank.id} />
              <button
                type="submit"
                className="pressable w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-left text-sm font-medium"
              >
                {bank.displayName}
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
