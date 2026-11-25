import { Building2, CreditCard, Banknote } from "lucide-react";

export type BankProvider = "MANUAL" | "PLAID" | "GOCARDLESS";

export interface BankInfo {
  id: string;
  name: string;
  displayName: string;
  icon: typeof Building2;
  type: "Major Bank" | "Credit Card" | "Credit Union" | "Online Bank" | "Regional Bank";
  country: string;
  providers: BankProvider[];
  logo?: string;
  institutionId?: {
    plaid?: string;
    gocardless?: string;
  };
}

/** Bancos brasileiros para cadastro manual de contas */
export const BANKS: BankInfo[] = [
  {
    id: "nubank",
    name: "Nubank",
    displayName: "Nubank",
    icon: CreditCard,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "itau",
    name: "Itaú",
    displayName: "Itaú Unibanco",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "bradesco",
    name: "Bradesco",
    displayName: "Bradesco",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "banco_do_brasil",
    name: "Banco do Brasil",
    displayName: "Banco do Brasil",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "caixa",
    name: "Caixa",
    displayName: "Caixa Econômica Federal",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "santander",
    name: "Santander",
    displayName: "Santander Brasil",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "inter",
    name: "Inter",
    displayName: "Banco Inter",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "c6",
    name: "C6 Bank",
    displayName: "C6 Bank",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "btg",
    name: "BTG Pactual",
    displayName: "BTG Pactual",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "xp",
    name: "XP",
    displayName: "XP Investimentos",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "picpay",
    name: "PicPay",
    displayName: "PicPay",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    displayName: "Mercado Pago",
    icon: CreditCard,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "pagbank",
    name: "PagBank",
    displayName: "PagBank",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "neon",
    name: "Neon",
    displayName: "Neon",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "will",
    name: "Will Bank",
    displayName: "Will Bank",
    icon: CreditCard,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "original",
    name: "Original",
    displayName: "Banco Original",
    icon: Building2,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "next",
    name: "Next",
    displayName: "Next",
    icon: Banknote,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "safra",
    name: "Safra",
    displayName: "Banco Safra",
    icon: Building2,
    type: "Major Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "banrisul",
    name: "Banrisul",
    displayName: "Banrisul",
    icon: Building2,
    type: "Regional Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "sicoob",
    name: "Sicoob",
    displayName: "Sicoob",
    icon: Building2,
    type: "Credit Union",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "sicredi",
    name: "Sicredi",
    displayName: "Sicredi",
    icon: Building2,
    type: "Credit Union",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "porto_bank",
    name: "Porto Bank",
    displayName: "Porto Bank",
    icon: CreditCard,
    type: "Credit Card",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "digio",
    name: "Digio",
    displayName: "Digio",
    icon: CreditCard,
    type: "Credit Card",
    country: "BR",
    providers: ["MANUAL"],
  },
  {
    id: "stone",
    name: "Stone",
    displayName: "Stone",
    icon: CreditCard,
    type: "Online Bank",
    country: "BR",
    providers: ["MANUAL"],
  },
];

export function getBanksByCountry(country: string): BankInfo[] {
  return BANKS.filter((bank) => bank.country === country);
}

export function getBanksByProvider(provider: BankProvider): BankInfo[] {
  return BANKS.filter((bank) => bank.providers.includes(provider));
}

export function searchBanks(query: string): BankInfo[] {
  const lowercaseQuery = query.toLowerCase();
  return BANKS.filter(
    (bank) =>
      bank.name.toLowerCase().includes(lowercaseQuery) ||
      bank.displayName.toLowerCase().includes(lowercaseQuery) ||
      bank.type.toLowerCase().includes(lowercaseQuery)
  );
}

export function getBankById(id: string): BankInfo | undefined {
  return BANKS.find((bank) => bank.id === id);
}

export const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brasil",
};

export const PROVIDER_NAMES: Record<BankProvider, string> = {
  MANUAL: "Manual",
  PLAID: "Plaid",
  GOCARDLESS: "GoCardless",
};
