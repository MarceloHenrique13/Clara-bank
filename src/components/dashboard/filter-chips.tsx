"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconX } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilterChip {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

export function FilterChips({ chips, onClearAll }: FilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <span className="text-sm font-medium text-muted-foreground">
        Filtros ativos:
      </span>

      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1 pr-1 hover:bg-destructive/10 transition-colors"
        >
          <span className="text-xs">
            {chip.label}: {chip.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
            onClick={chip.onRemove}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Limpar tudo
        </Button>
      )}
    </div>
  );
}

export function createFilterChips(
  filters: Record<string, any>,
  displayOptions: {
    accounts?: Array<{ id: string; name: string }>;
    categories?: Array<{ id: string; name: string }>;
  },
  onRemoveFilter: (key: string) => void
): FilterChip[] {
  const chips: FilterChip[] = [];

  // Search filter
  if (filters.search) {
    chips.push({
      key: "search",
      label: "Busca",
      value: filters.search,
      onRemove: () => onRemoveFilter("search"),
    });
  }

  // Account filter
  if (filters.accountId) {
    const account = displayOptions.accounts?.find(
      (a) => a.id === filters.accountId
    );
    chips.push({
      key: "account",
      label: "Conta",
      value: account?.name || filters.accountId,
      onRemove: () => onRemoveFilter("accountId"),
    });
  }

  // Category filter
  if (filters.categoryId) {
    const category = displayOptions.categories?.find(
      (c) => c.id === filters.categoryId
    );
    chips.push({
      key: "category",
      label: "Categoria",
      value: category?.name || filters.categoryId,
      onRemove: () => onRemoveFilter("categoryId"),
    });
  }

  // Status filter
  if (filters.status) {
    const statusLabels: Record<string, string> = {
      RECONCILED: "conciliada",
      NEEDS_CATEGORIZATION: "precisa de categoria",
      NEEDS_REVIEW: "precisa de revisão",
      IN_PROGRESS: "em andamento",
    };
    chips.push({
      key: "status",
      label: "Status",
      value:
        statusLabels[filters.status] ??
        filters.status.replace("_", " ").toLowerCase(),
      onRemove: () => onRemoveFilter("status"),
    });
  }

  // Type filter
  if (filters.type) {
    const typeLabels: Record<string, string> = {
      INCOME: "receita",
      EXPENSE: "despesa",
      TRANSFER: "transferência",
    };
    chips.push({
      key: "type",
      label: "Tipo",
      value: typeLabels[filters.type] ?? filters.type.toLowerCase(),
      onRemove: () => onRemoveFilter("type"),
    });
  }

  // Uncategorized filter
  if (filters.uncategorized) {
    chips.push({
      key: "uncategorized",
      label: "Filtro",
      value: "Sem categoria",
      onRemove: () => onRemoveFilter("uncategorized"),
    });
  }

  // Date range filter
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    chips.push({
      key: "dateRange",
      label: "Período",
      value: `${format(startDate, "dd MMM", { locale: ptBR })} - ${format(endDate, "dd MMM", { locale: ptBR })}`,
      onRemove: () => {
        onRemoveFilter("startDate");
        onRemoveFilter("endDate");
      },
    });
  } else if (filters.startDate) {
    chips.push({
      key: "startDate",
      label: "De",
      value: format(new Date(filters.startDate), "dd MMM yyyy", {
        locale: ptBR,
      }),
      onRemove: () => onRemoveFilter("startDate"),
    });
  } else if (filters.endDate) {
    chips.push({
      key: "endDate",
      label: "Até",
      value: format(new Date(filters.endDate), "dd MMM yyyy", {
        locale: ptBR,
      }),
      onRemove: () => onRemoveFilter("endDate"),
    });
  }

  return chips;
}
