import { NewExpenseForm } from "@/components/mobile/new-expense-form";
import { getExpenseFormData } from "@/actions/expense-actions";
import type { MoneyEntryType } from "@/lib/expense-categories";

export const metadata = {
  title: "Novo lançamento · SkibiriDin",
};

type PageProps = {
  searchParams: Promise<{ type?: string; accountId?: string }>;
};

function parseType(value?: string): MoneyEntryType | null {
  if (
    value === "income" ||
    value === "expense" ||
    value === "transfer" ||
    value === "card_expense"
  ) {
    return value;
  }
  return null;
}

export default async function NewExpensePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialType = parseType(params.type);
  const initialAccountId = params.accountId?.trim() || null;

  const [expenseData, incomeData] = await Promise.all([
    getExpenseFormData("expense"),
    getExpenseFormData("income"),
  ]);

  return (
    <NewExpenseForm
      categories={expenseData.categories}
      incomeCategories={incomeData.categories}
      accounts={expenseData.accounts}
      initialType={initialType}
      initialAccountId={initialAccountId}
    />
  );
}
