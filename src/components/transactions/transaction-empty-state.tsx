"use client";

import { Button } from "@/components/ui/button";
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconClockQuestion,
  IconCircleCheckFilled,
  IconDatabase,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface TransactionEmptyStateProps {
  hasActiveFilters: boolean;
  filterType?: "uncategorized" | "search" | "status" | "general";
  searchQuery?: string;
}

export function TransactionEmptyState({
  hasActiveFilters,
  filterType = "general",
  searchQuery,
}: TransactionEmptyStateProps) {
  const router = useRouter();

  const handleClearFilters = () => {
    router.push("/dashboard/transactions");
  };
  const getEmptyStateContent = () => {
    if (!hasActiveFilters) {
      return {
        icon: <IconDatabase className="h-12 w-12 text-muted-foreground" />,
        title: "Nenhuma transação ainda",
        description:
          "Você ainda não adicionou transações à sua conta no SkibiriDin.",
        action: null,
      };
    }

    switch (filterType) {
      case "uncategorized":
        return {
          icon: (
            <IconCircleCheckFilled className="h-12 w-12 text-emerald-500" />
          ),
          title: "Todas as transações categorizadas!",
          description:
            "Ótimo trabalho! Todas as suas transações foram atribuídas a categorias.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconFilter className="h-4 w-4 mr-2" />
              Ver todas as transações
            </Button>
          ),
        };

      case "search":
        return {
          icon: <IconSearch className="h-12 w-12 text-muted-foreground" />,
          title: `Nenhuma transação encontrada para "${searchQuery}"`,
          description:
            "Tente ajustar os termos da busca ou verifique a ortografia.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Limpar busca
            </Button>
          ),
        };

      case "status":
        return {
          icon: (
            <IconClockQuestion className="h-12 w-12 text-muted-foreground" />
          ),
          title: "Nenhuma transação com este status",
          description:
            "Tente selecionar outro status ou limpe o filtro para ver todas as transações.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconFilter className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          ),
        };

      default:
        return {
          icon: <IconFilter className="h-12 w-12 text-muted-foreground" />,
          title: "Nenhuma transação corresponde aos filtros",
          description: "Tente ajustar os filtros para ver mais resultados.",
          action: (
            <Button onClick={handleClearFilters} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Limpar todos os filtros
            </Button>
          ),
        };
    }
  };

  const { icon, title, description, action } = getEmptyStateContent();

  return (
    <div className="border rounded-lg">
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4">{icon}</div>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {description}
        </p>

        {action && <div className="mt-2">{action}</div>}
      </div>

      {!hasActiveFilters && (
        <div className="border-t px-6 py-4 bg-muted/20">
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconDatabase className="h-4 w-4" />
              <span>Importar do seu banco</span>
            </div>
            <div className="flex items-center gap-2">
              <IconRefresh className="h-4 w-4" />
              <span>Experimentar dados de exemplo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
