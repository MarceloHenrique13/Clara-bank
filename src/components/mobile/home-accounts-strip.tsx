"use client";

import Link from "next/link";
import type { MobileHomeAccount } from "@/actions/expense-actions";

function formatMoney(amount: number, currency: string) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency === "USD" ? "BRL" : currency,
  });
}

function accountTypeLabel(type: string) {
  switch (type) {
    case "CHECKING":
      return "Conta";
    case "SAVINGS":
      return "Poupança";
    case "CREDIT_CARD":
      return "Cartão";
    case "INVESTMENT":
      return "Invest.";
    default:
      return type.replace(/_/g, " ");
  }
}

export function HomeAccountsStrip({
  accounts,
}: {
  accounts: MobileHomeAccount[];
}) {
  if (accounts.length === 0) {
    return (
      <section className="px-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold tracking-tight">Contas</h2>
        </div>
        <Link
          href="/dashboard/financial"
          className="pressable block rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground"
        >
          Cadastre sua primeira conta
        </Link>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-semibold tracking-tight">Contas</h2>
        <Link
          href="/dashboard/financial"
          className="text-xs font-medium text-brand"
        >
          Ver todas
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {accounts.map((account) => (
          <Link
            key={account.id}
            href={`/dashboard/financial/${account.id}`}
            className="pressable liquid-glass relative min-w-[9.5rem] shrink-0 overflow-hidden rounded-2xl px-4 py-3.5 shadow-[0_4px_16px_rgb(0_0_0_/_0.06)]"
          >
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{ backgroundColor: account.color || "var(--brand)" }}
            />
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {accountTypeLabel(account.type)}
            </p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold">
              {account.name}
            </p>
            <p className="mt-2 font-mono text-base font-semibold tabular-nums tracking-tight">
              {formatMoney(account.balance, account.currency)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
