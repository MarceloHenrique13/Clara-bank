import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, subHours, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type FinancialGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date | null;
  type: string;
  isActive: boolean;
};

type AssetNewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

interface InsightsSectionProps {
  goals: FinancialGoal[];
  assetNews: AssetNewsItem[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function calculateProgress(current: number, target: number) {
  return Math.min((current / target) * 100, 100);
}

function formatTimeAgo(dateString: string) {
  if (!dateString) return "recentemente";
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return "recentemente";
  }
}

export function InsightsSection({ goals, assetNews }: InsightsSectionProps) {
  // Find the emergency fund goal for display
  const emergencyFundGoal = goals.find(
    (goal) => goal.type === "EMERGENCY_FUND" && goal.isActive
  );

  // Get the latest asset news items (limit to 2 most recent)
  const recentNews = assetNews.slice(0, 2);

  return (
    <div className="border rounded-lg">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">Insights financeiros</h3>
        <p className="text-sm text-muted-foreground">
          Últimas atualizações de mercado e orientações financeiras
          personalizadas
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-3">
          {/* Display real asset news if available */}
          {recentNews.map((newsItem) => {
            const isFallback = newsItem.id.startsWith("fallback-");
            return (
              <div key={newsItem.id} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">
                  {newsItem.url === "#" ? (
                    <span>{newsItem.title}</span>
                  ) : (
                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {newsItem.title}
                    </a>
                  )}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Relacionado ao seu portfólio de investimentos
                  {isFallback && " • Notícias de exemplo (API indisponível)"}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="secondary"
                    className={
                      isFallback
                        ? "bg-gray-100 text-gray-700"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  >
                    {isFallback ? "📰" : "📈"} {newsItem.source}
                  </Badge>
                  <span className="text-muted-foreground">
                    {formatTimeAgo(newsItem.publishedAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Fallback content if no news available */}
          {recentNews.length === 0 && (
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">
                Notícias de mercado indisponíveis
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Adicione ativos de investimento para ver atualizações
                personalizadas do mercado
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700"
                >
                  💡 Dica
                </Badge>
              </div>
            </div>
          )}

          <div className="p-3 border rounded-lg">
            <h4 className="font-medium text-sm mb-1">
              Alerta de orçamento: categoria Restaurantes 85% utilizada
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              Considere reduzir gastos com restaurantes para ficar dentro do
              orçamento
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 text-xs"
              >
                ⚠️ Alerta de orçamento
              </Badge>
              <span className="text-muted-foreground">
                {formatDistanceToNow(subHours(new Date(), 6), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>

          {emergencyFundGoal && (
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium text-sm mb-1">
                {emergencyFundGoal.name}:{" "}
                {Math.round(
                  calculateProgress(
                    emergencyFundGoal.currentAmount,
                    emergencyFundGoal.targetAmount
                  )
                )}
                % concluído
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Faltam{" "}
                {formatCurrency(
                  emergencyFundGoal.targetAmount -
                    emergencyFundGoal.currentAmount
                )}{" "}
                para atingir sua meta
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(subDays(new Date(), 1), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
