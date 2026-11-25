"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  IconSearch,
  IconFilter,
  IconCalendar,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Spinner } from "@/components/ui/spinner";

type Account = {
  id: string;
  name: string;
  type: string;
};

type Category = {
  id: string;
  name: string;
};

interface TransactionsFilterProps {
  accounts: Account[];
  categories: Category[];
  totalCount: number;
}

export function TransactionsFilter({
  accounts,
  categories,
  totalCount,
}: TransactionsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current filter values from URL
  const currentSearch = searchParams.get("search") || "";
  const currentAccount = searchParams.get("account") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentType = searchParams.get("type") || "";
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const dateRange: DateRange | undefined =
    startDate && endDate
      ? {
          from: new Date(startDate),
          to: new Date(endDate),
        }
      : undefined;

  // Helper to update URL with new search params
  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove parameters
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value.trim() !== "" && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  // Handle search input with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      updateFilters({ search: value });
    },
    [updateFilters]
  );

  // Handle date range selection
  const handleDateRangeChange = useCallback(
    (range: DateRange | undefined) => {
      updateFilters({
        startDate: range?.from?.toISOString(),
        endDate: range?.to?.toISOString(),
      });
    },
    [updateFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(window.location.pathname);
    });
  }, [router, startTransition]);

  // Count active filters
  const activeFiltersCount = [
    currentSearch,
    currentAccount,
    currentCategory,
    currentStatus,
    currentType,
    startDate,
    endDate,
  ].filter(Boolean).length;

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5" />
          <h3 className="font-semibold">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={isPending}
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar</label>
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar transações..."
              className="pl-8"
              defaultValue={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Account Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Conta</label>
          <Select
            value={currentAccount || "all"}
            onValueChange={(value) => updateFilters({ account: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria</label>
          <Select
            value={currentCategory || "all"}
            onValueChange={(value) => updateFilters({ category: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={currentStatus || "all"}
            onValueChange={(value) => updateFilters({ status: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="RECONCILED">Conciliada</SelectItem>
              <SelectItem value="NEEDS_CATEGORIZATION">
                Precisa categorizar
              </SelectItem>
              <SelectItem value="NEEDS_REVIEW">Precisa revisão</SelectItem>
              <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo</label>
          <Select
            value={currentType || "all"}
            onValueChange={(value) => updateFilters({ type: value })}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="INCOME">Receita</SelectItem>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
              <SelectItem value="TRANSFER">Transferência</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isPending}
              >
                <IconCalendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Selecione um período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Filtros ativos:</span>
            {currentSearch && (
              <Badge variant="outline" className="gap-1">
                Busca: {currentSearch}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateFilters({ search: "all" })}
                />
              </Badge>
            )}
            {currentAccount && (
              <Badge variant="outline" className="gap-1">
                Conta: {accounts.find((a) => a.id === currentAccount)?.name}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateFilters({ account: "all" })}
                />
              </Badge>
            )}
            {currentCategory && (
              <Badge variant="outline" className="gap-1">
                Categoria:{" "}
                {categories.find((c) => c.id === currentCategory)?.name}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateFilters({ category: "all" })}
                />
              </Badge>
            )}
            {currentStatus && (
              <Badge variant="outline" className="gap-1">
                Status: {currentStatus.replace(/_/g, " ").toLowerCase()}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateFilters({ status: "all" })}
                />
              </Badge>
            )}
            {currentType && (
              <Badge variant="outline" className="gap-1">
                Tipo: {currentType.toLowerCase()}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateFilters({ type: "all" })}
                />
              </Badge>
            )}
            {dateRange && (
              <Badge variant="outline" className="gap-1">
                Data: {format(dateRange.from!, "MMM dd")} -{" "}
                {format(dateRange.to!, "MMM dd")}
                <IconX
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() =>
                    updateFilters({ startDate: "all", endDate: "all" })
                  }
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner size={16} />
              Filtrando...
            </span>
          ) : totalCount === 1 ? (
            "1 transação encontrada"
          ) : (
            `${totalCount.toLocaleString()} transações encontradas`
          )}
        </p>
      </div>
    </div>
  );
}
