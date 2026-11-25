import Image from "next/image";
import Link from "next/link";
import { IconPlus } from "@tabler/icons-react";
import { getMobileHomeData } from "@/actions/expense-actions";
import { HomeAccountsStrip } from "./home-accounts-strip";
import { HomeOpenInvoices } from "./home-open-invoices";
import { HomeCategoryDonut } from "./home-category-donut";

export async function MobileHome() {
  const data = await getMobileHomeData();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pb-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="SkibiriDin"
            width={36}
            height={36}
            className="size-9 object-contain dark:drop-shadow-[0_0_1px_rgba(255,255,255,0.55)]"
            priority
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              SkibiriDin
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Início
            </h1>
          </div>
        </div>
        <Link
          href="/dashboard/expense/new"
          className="pressable inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-3.5 text-sm font-medium text-brand-foreground shadow-[0_6px_18px_rgb(217_79_122_/_0.3)]"
        >
          <IconPlus className="size-4" stroke={2.25} />
          Novo
        </Link>
      </header>

      <HomeAccountsStrip accounts={data.accounts} />
      <HomeOpenInvoices invoices={data.openInvoices} />
      <HomeCategoryDonut
        slices={data.categoryBreakdown}
        total={data.monthExpenseTotal}
      />
    </div>
  );
}
