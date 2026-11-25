/**
 * Credit card statement cycle helpers.
 * Closing/due days are calendar days 1–28 to avoid month-length edge cases.
 */

export type CreditCardCycleInput = {
  statementClosingDay: number;
  paymentDueDay: number;
  now?: Date;
};

export type CreditCardCycle = {
  periodStart: Date;
  periodEnd: Date;
  nextClosingDate: Date;
  dueDate: Date;
};

function clampDay(day: number) {
  return Math.min(28, Math.max(1, Math.floor(day)));
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Local midnight for year/month/day, clamping day to the month length. */
export function dateOnDay(year: number, monthIndex: number, day: number) {
  const safeDay = Math.min(clampDay(day), daysInMonth(year, monthIndex));
  return new Date(year, monthIndex, safeDay, 0, 0, 0, 0);
}

function addMonths(year: number, monthIndex: number, delta: number) {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

/**
 * Open statement period:
 * - periodStart = most recent closing day (inclusive)
 * - periodEnd / nextClosingDate = next closing day (exclusive for summing expenses)
 * - dueDate = payment due day on/after next closing (same or following month)
 */
export function getOpenStatementCycle({
  statementClosingDay,
  paymentDueDay,
  now = new Date(),
}: CreditCardCycleInput): CreditCardCycle {
  const closingDay = clampDay(statementClosingDay);
  const dueDay = clampDay(paymentDueDay);

  const y = now.getFullYear();
  const m = now.getMonth();
  const todayStart = new Date(y, m, now.getDate(), 0, 0, 0, 0);

  const closingThisMonth = dateOnDay(y, m, closingDay);

  let periodStart: Date;
  let nextClosingDate: Date;

  if (todayStart >= closingThisMonth) {
    periodStart = closingThisMonth;
    const next = addMonths(y, m, 1);
    nextClosingDate = dateOnDay(next.year, next.monthIndex, closingDay);
  } else {
    const prev = addMonths(y, m, -1);
    periodStart = dateOnDay(prev.year, prev.monthIndex, closingDay);
    nextClosingDate = closingThisMonth;
  }

  // Due date is typically after closing; if due day <= closing day, due is next month after closing.
  const closeY = nextClosingDate.getFullYear();
  const closeM = nextClosingDate.getMonth();
  let dueDate: Date;
  if (dueDay > closingDay) {
    dueDate = dateOnDay(closeY, closeM, dueDay);
  } else {
    const after = addMonths(closeY, closeM, 1);
    dueDate = dateOnDay(after.year, after.monthIndex, dueDay);
  }

  return {
    periodStart,
    periodEnd: nextClosingDate,
    nextClosingDate,
    dueDate,
  };
}

export function isValidCycleDay(day: number | null | undefined): day is number {
  return typeof day === "number" && Number.isInteger(day) && day >= 1 && day <= 28;
}

export function formatCycleDayLabel(date: Date) {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export type StatementCycleChoice = "current" | "next";

export type StatementOption = {
  id: StatementCycleChoice;
  label: string;
  hint: string;
  periodStart: Date;
  periodEnd: Date;
};

function monthLabel(date: Date) {
  const label = date.toLocaleDateString("pt-BR", { month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Current open statement + the following one, for fatura picker UX. */
export function getStatementOptions(
  input: CreditCardCycleInput
): StatementOption[] {
  const current = getOpenStatementCycle(input);
  const next = getOpenStatementCycle({
    ...input,
    now: current.periodEnd,
  });

  return [
    {
      id: "current",
      label: "Fatura atual",
      hint: `Fecha ${formatCycleDayLabel(current.nextClosingDate)} · ${monthLabel(current.nextClosingDate)}`,
      periodStart: current.periodStart,
      periodEnd: current.periodEnd,
    },
    {
      id: "next",
      label: "Próxima fatura",
      hint: `Fecha ${formatCycleDayLabel(next.nextClosingDate)} · ${monthLabel(next.nextClosingDate)}`,
      periodStart: next.periodStart,
      periodEnd: next.periodEnd,
    },
  ];
}

/**
 * Pick a transaction date that lands in the chosen statement window.
 * Keeps the purchase date when it already falls inside; otherwise clamps
 * into the period so open-invoice aggregates stay correct.
 */
export function resolveStatementTransactionDate(
  purchaseDate: Date,
  choice: StatementCycleChoice,
  input: CreditCardCycleInput
): Date {
  const options = getStatementOptions(input);
  const option = options.find((o) => o.id === choice) ?? options[0];
  const start = option.periodStart.getTime();
  const endExclusive = option.periodEnd.getTime();
  const t = purchaseDate.getTime();

  if (t >= start && t < endExclusive) {
    return purchaseDate;
  }
  if (t < start) {
    return new Date(option.periodStart);
  }
  // After period end → place on last includable day (1ms before next close)
  return new Date(endExclusive - 1);
}

/** Parse YYYY-MM-DD (or ISO) into local calendar date at noon (DST-safe). */
export function parseLocalDateInput(value: string | Date | undefined | null): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0,
    0
  );
}

export function toDateInputValue(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
