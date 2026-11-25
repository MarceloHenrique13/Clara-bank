import { SpendingTrendsChart } from "@/components/charts/SpendingTrendsChart";

type SpendingTrendsData = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  budget: number;
}[];

interface AnalyticsSectionProps {
  data: SpendingTrendsData;
}

export function AnalyticsSection({ data }: AnalyticsSectionProps) {
  return (
    <div className="lg:col-span-2">
      <div className="border rounded-lg">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Tendências de gastos</h3>
          <p className="text-sm text-muted-foreground">
            Análise mensal de gastos, orçamento e receita
          </p>
        </div>
        <div className="p-6 pt-4">
          <div className="h-80">
            <SpendingTrendsChart data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
