"use client";

import Link from "next/link";
import type { MobileHomeInvoice } from "@/actions/expense-actions";

function formatMoney(amount: number, currency: string) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: currency === "USD" ? "BRL" : currency,
  });
}

function daysUntil(isoDate: string) {
  const due = new Date(isoDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

export function HomeOpenInvoices({
  invoices,
}: {
  invoices: MobileHomeInvoice[];
}) {
  const open = invoices.filter((invoice) => invoice.openAmount > 0);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-semibold tracking-tight">
          Faturas em aberto
        </h2>
        {open.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {open.length} cartão{open.length > 1 ? "ões" : ""}
          </span>
        )}
      </div>

      {open.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-5 text-sm text-muted-foreground">
          Nenhuma fatura aberta. Quando houver gastos no cartão neste ciclo,
          o valor aparece aqui.
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {open.map((invoice) => {
            const dueIn = daysUntil(invoice.dueDate);
            const urgency =
              dueIn < 0
                ? "Vencida"
                : dueIn === 0
                  ? "Vence hoje"
                  : dueIn <= 7
                    ? `Vence em ${dueIn}d`
                    : `Vence ${invoice.dueLabel}`;

            return (
              <li key={invoice.accountId}>
                <div className="liquid-glass rounded-2xl px-4 py-3.5 shadow-[0_4px_16px_rgb(0_0_0_/_0.05)]">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: invoice.color || "var(--brand)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {invoice.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Fecha {invoice.closesLabel} · {urgency}
                      </p>
                      <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-rose-600">
                        {formatMoney(invoice.openAmount, invoice.currency)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/dashboard/financial/${invoice.accountId}`}
                          className="rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium"
                        >
                          Ver cartão
                        </Link>
                        <Link
                          href={`/dashboard/financial/${invoice.accountId}?pay=1`}
                          className="rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground"
                        >
                          Pagar fatura
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
