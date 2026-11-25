"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { MobileHomeCategorySlice } from "@/actions/expense-actions";

function formatMoney(amount: number) {
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function HomeCategoryDonut({
  slices,
  total,
}: {
  slices: MobileHomeCategorySlice[];
  total: number;
}) {
  const top = slices.slice(0, 6);
  const chartData =
    top.length > 0
      ? top.map((s) => ({
          name: s.name,
          value: s.amount,
          color: s.color,
        }))
      : [{ name: "Sem gastos", value: 1, color: "#E2E8F0" }];

  return (
    <section>
      <div className="mb-3 px-1">
        <h2 className="text-base font-semibold tracking-tight">
          Despesas por categoria
        </h2>
        <p className="text-xs text-muted-foreground">Este mês</p>
      </div>

      <div className="liquid-glass rounded-3xl px-3 py-4 shadow-[0_4px_16px_rgb(0_0_0_/_0.05)]">
        <div className="relative mx-auto h-48 w-full max-w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={82}
                strokeWidth={2}
                stroke="hsl(var(--background))"
                paddingAngle={top.length > 1 ? 2 : 0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="font-mono text-sm font-semibold tabular-nums">
              {formatMoney(total)}
            </p>
          </div>
        </div>

        {top.length > 0 ? (
          <ul className="mt-2 space-y-2 px-1">
            {top.map((slice) => {
              const pct = total > 0 ? (slice.amount / total) * 100 : 0;
              return (
                <li
                  key={slice.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {slice.icon ? `${slice.icon} ` : ""}
                    {slice.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {pct.toFixed(0)}%
                  </span>
                  <span className="shrink-0 font-mono text-xs font-medium tabular-nums">
                    {formatMoney(slice.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sem despesas categorizadas neste mês
          </p>
        )}
      </div>
    </section>
  );
}
