"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { payCreditCardBill } from "@/actions/expense-actions";

type PayAccount = {
  id: string;
  name: string;
  type: string;
};

export function PayBillForm({
  cardAccountId,
  openAmount,
  payFromAccounts,
  defaultOpen = false,
}: {
  cardAccountId: string;
  openAmount: number;
  payFromAccounts: PayAccount[];
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(defaultOpen);
  const [busy, setBusy] = React.useState(false);
  const [fromAccountId, setFromAccountId] = React.useState(
    payFromAccounts[0]?.id ?? ""
  );
  const [amountReais, setAmountReais] = React.useState(
    openAmount > 0 ? openAmount.toFixed(2).replace(".", ",") : ""
  );

  async function onPay(e: React.FormEvent) {
    e.preventDefault();
    const normalized = amountReais.replace(/\./g, "").replace(",", ".");
    const reais = Number(normalized);
    if (!Number.isFinite(reais) || reais <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setBusy(true);
    const result = await payCreditCardBill({
      cardAccountId,
      amountCents: Math.round(reais * 100),
      fromAccountId: fromAccountId || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Fatura paga");
    setOpen(false);
    router.refresh();
  }

  if (openAmount <= 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
        Nenhuma fatura em aberto neste ciclo.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 text-left text-sm font-medium text-brand"
      >
        {open ? "Cancelar pagamento" : "Pagar fatura"}
      </button>
      {open && (
        <form
          onSubmit={onPay}
          className="space-y-3 border-t border-border/50 px-4 py-3"
        >
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Valor</span>
            <input
              value={amountReais}
              onChange={(e) => setAmountReais(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </label>
          {payFromAccounts.length > 0 && (
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Pagar com</span>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              >
                {payFromAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-medium text-brand-foreground disabled:opacity-60"
          >
            Confirmar pagamento
          </button>
        </form>
      )}
    </div>
  );
}
