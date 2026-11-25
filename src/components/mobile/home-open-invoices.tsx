"use client";

import Link from "next/link";
import type { MobileHomeInvoice } from "@/actions/expense-actions";

function formatMoney(amount: number, currency: string) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency === "USD" ? "BRL" : currency,
  });
}

export function HomeOpenInvoices({
  invoices,
}: {
  invoices: MobileHomeInvoice[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-semibold tracking-tight">
          Faturas em aberto
        </h2>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
          Configure o dia de fechamento e vencimento no cartão para ver o
          preview da fatura.
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {invoices.map((invoice) => (
            <li key={invoice.accountId}>
              <Link
                href={`/dashboard/financial/${invoice.accountId}`}
                className="pressable liquid-glass flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-[0_4px_16px_rgb(0_0_0_/_0.05)]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: invoice.color || "var(--brand)",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {invoice.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Fecha {invoice.closesLabel} · Vence {invoice.dueLabel}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                  {formatMoney(invoice.openAmount, invoice.currency)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
