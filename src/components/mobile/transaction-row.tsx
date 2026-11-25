"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteTransaction,
  updateTransactionDetails,
} from "@/actions/expense-actions";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function toDateInput(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type TransactionRowData = {
  id: string;
  description: string;
  merchant: string;
  amount: number;
  date: Date | string;
  category?: { name: string } | null;
  account?: { name: string } | null;
};

export function TransactionRow({ tx }: { tx: TransactionRowData }) {
  const router = useRouter();
  const amount = Number(tx.amount);
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [description, setDescription] = React.useState(
    tx.merchant || tx.description
  );
  const [amountReais, setAmountReais] = React.useState(
    String(Math.abs(amount).toFixed(2)).replace(".", ",")
  );
  const [date, setDate] = React.useState(
    toDateInput(new Date(tx.date))
  );

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    const normalized = amountReais.replace(/\./g, "").replace(",", ".");
    const reais = Number(normalized);
    if (!Number.isFinite(reais) || reais <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setBusy(true);
    const result = await updateTransactionDetails({
      transactionId: tx.id,
      description,
      amountCents: Math.round(reais * 100),
      date,
    });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Lançamento atualizado");
    setOpen(false);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Apagar este lançamento?")) return;
    setBusy(true);
    const result = await deleteTransaction(tx.id);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Lançamento apagado");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">
            {tx.merchant || tx.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("pt-BR", {
              day: "2-digit",
              month: "short",
            }).format(new Date(tx.date))}
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
      </button>

      {open && (
        <form
          onSubmit={onSave}
          className="space-y-3 border-t border-border/50 px-4 py-3"
        >
          <label className="block space-y-1 text-xs">
            <span className="text-muted-foreground">Descrição</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Valor</span>
              <input
                value={amountReais}
                onChange={(e) => setAmountReais(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1 text-xs">
              <span className="text-muted-foreground">Data</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-xl bg-brand px-3 py-2 text-sm font-medium text-brand-foreground disabled:opacity-60"
            >
              Salvar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 disabled:opacity-60"
            >
              Apagar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
