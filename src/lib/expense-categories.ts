export const EXPENSE_CATEGORIES = [
  { slug: "beleza", name: "Beleza", icon: "💅", color: "#EC4899" },
  { slug: "casa", name: "Casa", icon: "🏠", color: "#F59E0B" },
  { slug: "educacao", name: "Educação", icon: "📚", color: "#3B82F6" },
  { slug: "eletronicos", name: "Eletrônicos", icon: "📱", color: "#6366F1" },
  { slug: "lazer", name: "Lazer", icon: "🎬", color: "#8B5CF6" },
  { slug: "pet", name: "Pet", icon: "🐾", color: "#D97706" },
  { slug: "presente", name: "Presente", icon: "🎁", color: "#EF4444" },
  { slug: "restaurante", name: "Restaurante", icon: "🍽️", color: "#F97316" },
  { slug: "saude", name: "Saúde", icon: "💊", color: "#10B981" },
  { slug: "servicos", name: "Serviços", icon: "🔧", color: "#64748B" },
  { slug: "supermercado", name: "Supermercado", icon: "🛒", color: "#22C55E" },
  { slug: "transporte", name: "Transporte", icon: "🚌", color: "#0EA5E9" },
  { slug: "vestuario", name: "Vestuário", icon: "👕", color: "#A855F7" },
  { slug: "viagem", name: "Viagem", icon: "✈️", color: "#14B8A6" },
  { slug: "outros", name: "Outros", icon: "✨", color: "#94A3B8" },
] as const;

export type ExpenseCategorySlug =
  (typeof EXPENSE_CATEGORIES)[number]["slug"];

export const INCOME_CATEGORIES = [
  { slug: "salario", name: "Salário", icon: "💰", color: "#22C55E" },
  { slug: "freelance", name: "Freelance", icon: "💻", color: "#06B6D4" },
  { slug: "investimentos", name: "Investimentos", icon: "📈", color: "#0EA5E9" },
  { slug: "reembolso", name: "Reembolso", icon: "↩️", color: "#14B8A6" },
  { slug: "outras-receitas", name: "Outras receitas", icon: "✨", color: "#94A3B8" },
] as const;

export type MoneyEntryType =
  | "expense"
  | "income"
  | "transfer"
  | "card_expense";

/** Contas para débito/PIX (despesa normal e receita). */
export const LIQUID_ACCOUNT_TYPES = ["CHECKING", "SAVINGS", "OTHER"] as const;

export function isLiquidAccountType(type: string) {
  return (LIQUID_ACCOUNT_TYPES as readonly string[]).includes(type);
}

/** Stable seed IDs for demo family */
export function seedCategoryId(slug: string) {
  return `cat-${slug}`;
}
