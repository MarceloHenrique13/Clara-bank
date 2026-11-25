"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconArrowsExchange,
  IconBackspace,
  IconCheck,
  IconCreditCard,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  createMoneyEntry,
  createTransfer,
} from "@/actions/expense-actions";
import type {
  AccountOption,
  ExpenseCategoryOption,
} from "@/actions/expense-actions";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  isLiquidAccountType,
  type MoneyEntryType,
} from "@/lib/expense-categories";
import {
  getStatementOptions,
  isValidCycleDay,
  toDateInputValue,
  type StatementCycleChoice,
} from "@/lib/credit-card-cycle";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "back"] as const;
const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

type Step =
  | "type"
  | "from_account"
  | "to_account"
  | "card"
  | "amount"
  | "account"
  | "details"
  | "transfer_note";

function formatBRLFromCents(cents: number) {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type NewExpenseFormProps = {
  categories: ExpenseCategoryOption[];
  incomeCategories: ExpenseCategoryOption[];
  accounts: AccountOption[];
  initialType?: MoneyEntryType | null;
};

function firstStepForType(type: MoneyEntryType): Step {
  if (type === "transfer") return "from_account";
  if (type === "card_expense") return "card";
  return "amount";
}

export function NewExpenseForm({
  categories,
  incomeCategories,
  accounts,
  initialType = null,
}: NewExpenseFormProps) {
  const router = useRouter();
  const [entryType, setEntryType] = React.useState<MoneyEntryType | null>(
    initialType
  );
  const [step, setStep] = React.useState<Step>(
    initialType ? firstStepForType(initialType) : "type"
  );
  const [cents, setCents] = React.useState(0);
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [accountId, setAccountId] = React.useState("");
  const [fromAccountId, setFromAccountId] = React.useState("");
  const [toAccountId, setToAccountId] = React.useState("");
  const [entryDate, setEntryDate] = React.useState(() => toDateInputValue());
  const [isFixed, setIsFixed] = React.useState(false);
  const [statementCycle, setStatementCycle] =
    React.useState<StatementCycleChoice>("current");
  const [installments, setInstallments] = React.useState(1);

  const isIncome = entryType === "income";
  const isTransfer = entryType === "transfer";
  const isCard = entryType === "card_expense";

  const catalogFallback = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const sourceCategories = isIncome ? incomeCategories : categories;
  const displayCategories =
    sourceCategories.length > 0
      ? sourceCategories
      : catalogFallback.map((c) => ({
          id: c.slug,
          name: c.name,
          icon: c.icon,
          color: c.color,
        }));

  const liquidAccounts = React.useMemo(
    () => accounts.filter((a) => isLiquidAccountType(a.type)),
    [accounts]
  );
  const creditCards = React.useMemo(
    () => accounts.filter((a) => a.type === "CREDIT_CARD"),
    [accounts]
  );
  const destinationAccounts = React.useMemo(
    () => accounts.filter((a) => a.id !== fromAccountId),
    [accounts, fromAccountId]
  );

  const selectedCard = React.useMemo(
    () => creditCards.find((a) => a.id === accountId) ?? null,
    [creditCards, accountId]
  );

  const statementOptions = React.useMemo(() => {
    if (
      !selectedCard ||
      !isValidCycleDay(selectedCard.statementClosingDay) ||
      !isValidCycleDay(selectedCard.paymentDueDay)
    ) {
      return [
        {
          id: "current" as const,
          label: "Fatura atual",
          hint: "Configure o ciclo do cartão para ver datas",
        },
        {
          id: "next" as const,
          label: "Próxima fatura",
          hint: "Lançamento na fatura seguinte",
        },
      ];
    }
    return getStatementOptions({
      statementClosingDay: selectedCard.statementClosingDay,
      paymentDueDay: selectedCard.paymentDueDay,
    });
  }, [selectedCard]);

  function resetEntryFields() {
    setCategoryId(null);
    setNote("");
    setCents(0);
    setAccountId("");
    setFromAccountId("");
    setToAccountId("");
    setEntryDate(toDateInputValue());
    setIsFixed(false);
    setStatementCycle("current");
    setInstallments(1);
  }

  function chooseType(type: MoneyEntryType) {
    setEntryType(type);
    resetEntryFields();
    setStep(firstStepForType(type));
  }

  function onBack() {
    if (step === "type") {
      router.back();
      return;
    }

    if (step === "amount") {
      if (isTransfer) {
        setStep("to_account");
        return;
      }
      if (isCard) {
        setStep("card");
        return;
      }
      if (initialType) {
        router.back();
        return;
      }
      setStep("type");
      return;
    }

    if (step === "from_account" || step === "card") {
      if (initialType) {
        router.back();
        return;
      }
      setStep("type");
      return;
    }

    if (step === "to_account") {
      setStep("from_account");
      return;
    }

    if (step === "account") {
      setStep("amount");
      return;
    }

    if (step === "details") {
      if (isCard) {
        setStep("amount");
        return;
      }
      setStep("account");
      return;
    }

    if (step === "transfer_note") {
      setStep("amount");
    }
  }

  function onKey(key: (typeof KEYS)[number]) {
    if (key === "back") {
      setCents((prev) => Math.floor(prev / 10));
      return;
    }
    if (key === ",") return;
    setCents((prev) => {
      const next = prev * 10 + Number(key);
      return next > 99_999_999 ? prev : next;
    });
  }

  function goAfterAmount() {
    if (cents <= 0) {
      toast.error("Digite um valor");
      return;
    }
    if (isTransfer) {
      setStep("transfer_note");
      return;
    }
    if (isCard) {
      setStep("details");
      return;
    }
    setStep("account");
  }

  async function onSaveEntry() {
    if (cents <= 0) {
      toast.error("Digite um valor");
      return;
    }
    if (!note.trim()) {
      toast.error("Digite uma descrição");
      return;
    }
    if (!categoryId) {
      toast.error("Escolha uma categoria");
      return;
    }
    if (!accountId) {
      toast.error(isCard ? "Escolha um cartão" : "Escolha uma conta");
      return;
    }
    if (
      entryType !== "expense" &&
      entryType !== "income" &&
      entryType !== "card_expense"
    ) {
      toast.error("Escolha o tipo");
      return;
    }
    if (!entryDate) {
      toast.error("Escolha a data");
      return;
    }

    setSaving(true);
    const result = await createMoneyEntry({
      amountCents: cents,
      categoryId,
      accountId,
      note,
      type: entryType,
      date: entryDate,
      isFixed:
        entryType === "expense" || entryType === "income" ? isFixed : false,
      statementCycle: entryType === "card_expense" ? statementCycle : undefined,
      installments: entryType === "card_expense" ? installments : undefined,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    const successLabel =
      entryType === "income"
        ? "Receita registrada"
        : entryType === "card_expense"
          ? "Gasto no cartão registrado"
          : "Despesa registrada";

    toast.success(successLabel, {
      description: `${formatBRLFromCents(cents)} · ${result.categoryName}${
        note ? ` · ${note}` : ""
      }`,
    });
    router.push("/dashboard");
    router.refresh();
  }

  async function onSaveTransfer() {
    if (cents <= 0) {
      toast.error("Digite um valor");
      return;
    }
    if (!fromAccountId || !toAccountId) {
      toast.error("Escolha origem e destino");
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error("Origem e destino precisam ser diferentes");
      return;
    }
    if (!entryDate) {
      toast.error("Escolha a data");
      return;
    }

    setSaving(true);
    const result = await createTransfer({
      amountCents: cents,
      fromAccountId,
      toAccountId,
      note,
      date: entryDate,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Transferência registrada", {
      description: `${formatBRLFromCents(cents)} · ${result.fromAccountName} → ${result.toAccountName}`,
    });
    router.push("/dashboard");
    router.refresh();
  }

  const title =
    step === "type"
      ? "Novo lançamento"
      : entryType === "income"
        ? "Nova receita"
        : entryType === "transfer"
          ? "Nova transferência"
          : entryType === "card_expense"
            ? "Gasto no cartão"
            : "Nova despesa";

  const stepLabel = (() => {
    switch (step) {
      case "type":
        return "Tipo";
      case "from_account":
        return "1 · Conta de origem";
      case "to_account":
        return "2 · Conta de destino";
      case "card":
        return "1 · Cartão";
      case "amount":
        if (isTransfer) return "3 · Valor";
        if (isCard) return "2 · Valor";
        return "1 · Valor";
      case "account":
        return "2 · Conta";
      case "details":
        if (isCard) return "3 · Detalhes";
        return "3 · Descrição e categoria";
      case "transfer_note":
        return "4 · Detalhes";
      default:
        return "";
    }
  })();

  function renderDateField() {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium">Data</span>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
    );
  }

  function renderAccountPicker(opts: {
    list: AccountOption[];
    selectedId: string;
    onSelect: (id: string) => void;
    emptyMessage: string;
    nextLabel?: string;
    onNext?: () => void;
  }) {
    const {
      list,
      selectedId,
      onSelect,
      emptyMessage,
      nextLabel = "Continuar",
      onNext,
    } = opts;

    if (list.length === 0) {
      return (
        <div className="flex flex-1 flex-col justify-center gap-3 pb-8 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col gap-3 pb-4">
        <div className="flex flex-col gap-2">
          {list.map((account) => {
            const selected = selectedId === account.id;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => onSelect(account.id)}
                className={cn(
                  "pressable flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                  selected
                    ? "border-brand bg-accent text-primary"
                    : "border-border bg-card text-foreground"
                )}
              >
                {account.color && (
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {account.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {account.type === "CREDIT_CARD"
                      ? "Cartão de crédito"
                      : account.type === "SAVINGS"
                        ? "Poupança"
                        : account.type === "CHECKING"
                          ? "Conta corrente"
                          : account.type}
                  </span>
                </span>
                {selected && <IconCheck className="size-5 text-brand" />}
              </button>
            );
          })}
        </div>
        {onNext && (
          <Button
            type="button"
            size="lg"
            className="pressable mt-auto h-12 w-full rounded-full bg-brand text-base text-brand-foreground hover:bg-brand/90"
            onClick={onNext}
            disabled={!selectedId}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-md flex-col overflow-y-auto bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] md:static md:z-auto md:min-h-[calc(100dvh-4rem)] md:overflow-visible">
      <header className="mb-4 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={onBack}
          aria-label="Voltar"
        >
          <IconArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {stepLabel}
          </p>
          <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        </div>
      </header>

      {step === "type" && (
        <div className="flex flex-1 flex-col justify-center gap-3 pb-8">
          <p className="mb-2 text-center text-sm text-muted-foreground">
            O que você quer cadastrar?
          </p>
          <button
            type="button"
            onClick={() => chooseType("expense")}
            className="pressable liquid-glass flex items-center gap-4 rounded-2xl px-5 py-5 text-left shadow-[0_4px_16px_rgb(0_0_0_/_0.06)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-brand/15 text-brand">
              <IconTrendingDown className="size-6" stroke={2} />
            </span>
            <span>
              <span className="block text-base font-semibold">Despesa</span>
              <span className="text-sm text-muted-foreground">
                Débito, PIX e outros gastos
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => chooseType("income")}
            className="pressable liquid-glass flex items-center gap-4 rounded-2xl px-5 py-5 text-left shadow-[0_4px_16px_rgb(0_0_0_/_0.06)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconTrendingUp className="size-6" stroke={2} />
            </span>
            <span>
              <span className="block text-base font-semibold">Receita</span>
              <span className="text-sm text-muted-foreground">
                Registrar uma entrada
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => chooseType("transfer")}
            className="pressable liquid-glass flex items-center gap-4 rounded-2xl px-5 py-5 text-left shadow-[0_4px_16px_rgb(0_0_0_/_0.06)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
              <IconArrowsExchange className="size-6" stroke={2} />
            </span>
            <span>
              <span className="block text-base font-semibold">
                Transferência
              </span>
              <span className="text-sm text-muted-foreground">
                Entre suas contas
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => chooseType("card_expense")}
            className="pressable liquid-glass flex items-center gap-4 rounded-2xl px-5 py-5 text-left shadow-[0_4px_16px_rgb(0_0_0_/_0.06)]"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
              <IconCreditCard className="size-6" stroke={2} />
            </span>
            <span>
              <span className="block text-base font-semibold">
                Gastos cartão
              </span>
              <span className="text-sm text-muted-foreground">
                Compra no cartão de crédito
              </span>
            </span>
          </button>
        </div>
      )}

      {step === "from_account" &&
        renderAccountPicker({
          list: accounts,
          selectedId: fromAccountId,
          onSelect: (id) => {
            setFromAccountId(id);
            if (toAccountId === id) setToAccountId("");
          },
          emptyMessage: "Nenhuma conta disponível para transferir.",
          onNext: () => {
            if (!fromAccountId) {
              toast.error("Escolha a conta de origem");
              return;
            }
            setStep("to_account");
          },
        })}

      {step === "to_account" &&
        renderAccountPicker({
          list: destinationAccounts,
          selectedId: toAccountId,
          onSelect: setToAccountId,
          emptyMessage: "Cadastre outra conta para usar como destino.",
          onNext: () => {
            if (!toAccountId) {
              toast.error("Escolha a conta de destino");
              return;
            }
            if (toAccountId === fromAccountId) {
              toast.error("Origem e destino precisam ser diferentes");
              return;
            }
            setStep("amount");
          },
        })}

      {step === "card" &&
        renderAccountPicker({
          list: creditCards,
          selectedId: accountId,
          onSelect: setAccountId,
          emptyMessage:
            "Nenhum cartão de crédito cadastrado. Adicione um em Contas.",
          onNext: () => {
            if (!accountId) {
              toast.error("Escolha um cartão");
              return;
            }
            setStep("amount");
          },
        })}

      {step === "amount" && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="rounded-2xl bg-muted/50 px-4 py-8 text-center">
            <p className="mb-1 text-sm text-muted-foreground">Valor</p>
            <p
              className={cn(
                "font-mono text-4xl font-semibold tracking-tight tabular-nums",
                isIncome && "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {formatBRLFromCents(cents)}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onKey(key)}
                className="pressable flex h-14 items-center justify-center rounded-xl bg-muted/70 text-xl font-medium transition-colors hover:bg-muted"
                aria-label={key === "back" ? "Apagar" : key}
              >
                {key === "back" ? <IconBackspace className="size-6" /> : key}
              </button>
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            className="pressable h-12 w-full rounded-full bg-brand text-base text-brand-foreground hover:bg-brand/90"
            onClick={goAfterAmount}
          >
            Continuar
          </Button>
        </div>
      )}

      {step === "account" &&
        renderAccountPicker({
          list: liquidAccounts,
          selectedId: accountId,
          onSelect: setAccountId,
          emptyMessage:
            "Nenhuma conta corrente ou poupança disponível. Adicione uma em Contas.",
          onNext: () => {
            if (!accountId) {
              toast.error("Escolha uma conta");
              return;
            }
            setStep("details");
          },
        })}

      {step === "details" && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="rounded-2xl bg-muted/40 px-4 py-3 text-center">
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {formatBRLFromCents(cents)}
            </p>
          </div>

          {renderDateField()}

          {isCard && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">Fatura</p>
                <div className="flex flex-col gap-2">
                  {statementOptions.map((option) => {
                    const selected = statementCycle === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setStatementCycle(option.id)}
                        className={cn(
                          "pressable flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                          selected
                            ? "border-brand bg-accent text-primary"
                            : "border-border bg-card text-foreground"
                        )}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {option.hint}
                          </span>
                        </span>
                        {selected && (
                          <IconCheck className="size-5 shrink-0 text-brand" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Parcelas</p>
                <div className="grid grid-cols-4 gap-2">
                  {INSTALLMENT_OPTIONS.map((n) => {
                    const selected = installments === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setInstallments(n)}
                        className={cn(
                          "pressable rounded-xl border px-2 py-2.5 text-center text-sm font-semibold transition-colors",
                          selected
                            ? "border-brand bg-accent text-primary"
                            : "border-border bg-card text-muted-foreground"
                        )}
                      >
                        {n === 1 ? "À vista" : `${n}x`}
                      </button>
                    );
                  })}
                </div>
                {installments > 1 && cents > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {installments}x de{" "}
                    {formatBRLFromCents(Math.round(cents / installments))}
                    {" · "}valor total no cartão agora
                  </p>
                )}
              </div>
            </>
          )}

          <label className="block">
            <span className="mb-2 block text-sm font-medium">Descrição</span>
            <input
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isIncome
                  ? "Ex.: Salário março, freelance"
                  : "Ex.: Padaria, Uber, farmácia"
              }
              className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium">Categoria</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {displayCategories.map((cat) => {
                const selected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={cn(
                      "pressable flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center transition-colors",
                      selected
                        ? "border-brand bg-accent text-primary"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <span className="text-lg" aria-hidden>
                      {cat.icon || "✨"}
                    </span>
                    <span className="text-[11px] font-medium leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {(entryType === "expense" || entryType === "income") && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {isIncome ? "Receita fixa" : "Despesa fixa"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Marcar como recorrente todo mês
                </p>
              </div>
              <Switch
                checked={isFixed}
                onCheckedChange={setIsFixed}
                aria-label={isIncome ? "Receita fixa" : "Despesa fixa"}
                className="data-[state=checked]:bg-brand"
              />
            </div>
          )}

          <Button
            type="button"
            size="lg"
            className="pressable mt-auto h-12 w-full rounded-full bg-brand text-base text-brand-foreground hover:bg-brand/90"
            onClick={onSaveEntry}
            disabled={saving}
          >
            <IconCheck className="size-5" />
            {saving
              ? "Salvando…"
              : isIncome
                ? "Salvar receita"
                : isCard
                  ? "Salvar gasto"
                  : "Salvar despesa"}
          </Button>
        </div>
      )}

      {step === "transfer_note" && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="rounded-2xl bg-muted/40 px-4 py-3 text-center">
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {formatBRLFromCents(cents)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {accounts.find((a) => a.id === fromAccountId)?.name ?? "Origem"}{" "}
              → {accounts.find((a) => a.id === toAccountId)?.name ?? "Destino"}
            </p>
          </div>

          {renderDateField()}

          <label className="block">
            <span className="mb-2 block text-sm font-medium">
              Descrição{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </span>
            <input
              autoFocus
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex.: Reserva do mês, pagar fatura"
              className="h-12 w-full rounded-xl border border-input bg-background px-3 text-base outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onSaveTransfer();
                }
              }}
            />
          </label>

          <Button
            type="button"
            size="lg"
            className="pressable mt-auto h-12 w-full rounded-full bg-brand text-base text-brand-foreground hover:bg-brand/90"
            onClick={onSaveTransfer}
            disabled={saving}
          >
            <IconCheck className="size-5" />
            {saving ? "Salvando…" : "Salvar transferência"}
          </Button>
        </div>
      )}
    </div>
  );
}
