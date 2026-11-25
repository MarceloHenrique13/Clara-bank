"use client";

import { PlaidLinkModal } from "@/components/financial/plaid-link-modal";
import { TransactionImportButton } from "@/components/financial/transaction-import-button";
import { useRouter } from "next/navigation";

export function AccountsHeaderSection() {
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-primary">
          Contas
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as suas contas no SkibiriDin
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <TransactionImportButton onSuccess={handleSuccess} />
        <PlaidLinkModal onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
