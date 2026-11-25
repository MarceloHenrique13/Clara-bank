"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateFinancialAccountDetails } from "@/actions/financial-actions";

export function AccountEditForm({
  accountId,
  name,
  balance,
  defaultOpen = false,
}: {
  accountId: string;
  name: string;
  balance: number;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(defaultOpen);
  const [busy, setBusy] = React.useState(false);
  const [nextName, setNextName] = React.useState(name);
  const [nextBalance, setNextBalance] = React.useState(
    balance.toFixed(2).replace(".", ",")
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const normalized = nextBalance.replace(/\./g, "").replace(",", ".");
    const balanceValue = Number(normalized);
    if (!Number.isFinite(balanceValue)) {
      toast.error("Saldo inválido");
      return;
    }
    setBusy(true);
    const result = await updateFinancialAccountDetails({
      accountId,
      name: nextName,
      balance: balanceValue,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Conta atualizada");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 text-left text-sm font-medium"
      >
        {open ? "Fechar edição" : "Editar nome e saldo"}
      </button>
      {open && (
        <form
          onSubmit={onSave}
          className="space-y-3 border-t border-border/50 px-4 py-3"
        >
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Nome</span>
            <input
              value={nextName}
              onChange={(e) => setNextName(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Saldo atual</span>
            <input
              value={nextBalance}
              onChange={(e) => setNextBalance(e.target.value)}
              inputMode="decimal"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand px-3 py-2 text-sm font-medium text-brand-foreground disabled:opacity-60"
          >
            Salvar
          </button>
        </form>
      )}
    </div>
  );
}
