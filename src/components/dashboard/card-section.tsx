"use client";

import React from "react";
import { Divider } from "../Divider";
import { LineChartSupport } from "../charts/LineChartSupport";
import { volume, monthlyIncome } from "./volume";

export default function SupportDashboard() {
  //   const [isOpen, setIsOpen] = React.useState(false)
  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Início</h1>
          <p className="text-muted-foreground sm:text-sm/6">
            Monitoramento em tempo real das métricas com insights de IA
          </p>
        </div>
      </div>
      <Divider />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Visão geral de receitas
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-2xl font-semibold">$250,000</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-600">↗ 4.2%</span>
                  <span className="text-sm text-muted-foreground">
                    Últimos 30 dias
                  </span>
                </div>
              </div>
              <div className="flex-1 max-w-[300px]">
                <LineChartSupport
                  className="h-32"
                  data={monthlyIncome}
                  index="month"
                  categories={["Receita"]}
                  colors={["blue"]}
                  showTooltip={false}
                  valueFormatter={(number: number) =>
                    `$${Intl.NumberFormat("us").format(number)}`
                  }
                  startEndOnly={false}
                  showYAxis={false}
                  showXAxis={true}
                  showLegend={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Satisfação do cliente
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-2xl font-semibold">94%</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-emerald-600">↗ 5.3%</span>
                  <span className="text-sm text-muted-foreground">
                    Este mês
                  </span>
                </div>
              </div>
              <div className="flex-1 max-w-[300px]">
                <LineChartSupport
                  className="h-32"
                  data={volume}
                  index="time"
                  categories={["Hoje", "Ontem"]}
                  colors={["cyan", "pink"]}
                  showTooltip={false}
                  valueFormatter={(number: number) =>
                    Intl.NumberFormat("us").format(number).toString()
                  }
                  startEndOnly={true}
                  showYAxis={false}
                  showXAxis={true}
                  showLegend={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
