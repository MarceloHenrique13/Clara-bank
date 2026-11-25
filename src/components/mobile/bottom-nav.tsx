"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconArrowsExchange,
  IconCreditCard,
  IconHome,
  IconPlus,
  IconTrendingDown,
  IconTrendingUp,
  IconUser,
  IconWallet,
  IconX,
} from "@tabler/icons-react";
import type { MoneyEntryType } from "@/lib/expense-categories";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const tabs = [
  { href: "/dashboard", label: "Início", icon: IconHome, exact: true },
  {
    href: "/dashboard/financial",
    label: "Contas",
    icon: IconWallet,
  },
  {
    href: "/dashboard/expense/new",
    label: "Novo",
    icon: IconPlus,
    primary: true,
  },
  {
    href: "/dashboard/transactions",
    label: "Gastos",
    icon: IconCreditCard,
  },
  {
    href: "/dashboard/settings",
    label: "Perfil",
    icon: IconUser,
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const hideOnExpenseNew = pathname.startsWith("/dashboard/expense/new");

  if (hideOnExpenseNew) return null;

  function goTo(type: MoneyEntryType) {
    setOpen(false);
    router.push(`/dashboard/expense/new?type=${type}`);
  }

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="liquid-glass pointer-events-auto mx-auto grid h-[4.25rem] max-w-md grid-cols-5 items-end rounded-[1.75rem] px-1.5 shadow-[0_8px_32px_rgb(0_0_0_/_0.12),inset_0_1px_0_rgb(255_255_255_/_0.35)]">
          {tabs.map((tab) => {
            const active = isActive(
              pathname,
              tab.href,
              "exact" in tab ? Boolean(tab.exact) : false
            );
            const Icon = tab.icon;

            if ("primary" in tab && tab.primary) {
              return (
                <li key={tab.href} className="flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="pressable -mt-6 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-[0_10px_28px_rgb(217_79_122_/_0.4),inset_0_1px_0_rgb(255_255_255_/_0.25)] transition-transform"
                    aria-label="Novo lançamento"
                  >
                    <Icon className="size-7" stroke={2.25} />
                  </button>
                </li>
              );
            }

            return (
              <li key={`${tab.label}-${tab.href}`} className="pb-1">
                <Link
                  href={tab.href}
                  className={cn(
                    "pressable relative flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-tight",
                    active
                      ? "text-brand"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-2 top-1 h-9 rounded-2xl bg-brand/10"
                    />
                  )}
                  <Icon
                    className="relative size-5"
                    stroke={active ? 2.25 : 1.75}
                  />
                  <span className="relative">{tab.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="mx-auto max-w-md">
          <DrawerHeader className="relative text-left">
            <DrawerTitle>O que você quer cadastrar?</DrawerTitle>
            <DrawerClose
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Fechar"
            >
              <IconX className="size-4" />
            </DrawerClose>
          </DrawerHeader>
          <div className="flex flex-col gap-2.5 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => goTo("expense")}
              className="pressable flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-brand/15 text-brand">
                <IconTrendingDown className="size-5" stroke={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Despesa</span>
                <span className="text-xs text-muted-foreground">
                  Débito, PIX e outros gastos
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => goTo("income")}
              className="pressable flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <IconTrendingUp className="size-5" stroke={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Receita</span>
                <span className="text-xs text-muted-foreground">
                  Registrar uma entrada
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => goTo("transfer")}
              className="pressable flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                <IconArrowsExchange className="size-5" stroke={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Transferência
                </span>
                <span className="text-xs text-muted-foreground">
                  Entre suas contas
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => goTo("card_expense")}
              className="pressable flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 text-left transition-colors hover:bg-accent/50"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <IconCreditCard className="size-5" stroke={2} />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Gastos cartão
                </span>
                <span className="text-xs text-muted-foreground">
                  Compra no cartão de crédito
                </span>
              </span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
