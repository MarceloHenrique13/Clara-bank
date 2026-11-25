"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Calendar, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { importTransactions, syncAccountBalances, removeAllPlaidData } from "@/actions/plaid-actions";
import { importGoCardlessTransactions, syncGoCardlessBalances, removeAllGoCardlessData } from "@/actions/gocardless-actions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionImportButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function TransactionImportButton({ 
  onSuccess, 
  variant = "outline", 
  size = "default" 
}: TransactionImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleImportTransactions = async (days: number) => {
    try {
      setIsImporting(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Import from both Plaid and GoCardless
      const plaidResponse = await importTransactions(startDate, endDate);
      const goCardlessResponse = await importGoCardlessTransactions(startDate, endDate);
      
      let successCount = 0;
      let totalMessage = "";
      
      if (plaidResponse.success) {
        successCount++;
        totalMessage += plaidResponse.message;
      }
      
      if (goCardlessResponse.success) {
        successCount++;
        if (totalMessage) totalMessage += " | ";
        totalMessage += goCardlessResponse.message;
      }
      
      if (successCount > 0) {
        toast.success(totalMessage || "Transações importadas com sucesso", {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Import failed for all providers");
      }
    } catch (error) {
      console.error("Error importing transactions:", error);
      toast.error("Falha ao importar transações. Tente novamente.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncBalances = async () => {
    try {
      setIsSyncing(true);
      
      // Sync balances from both Plaid and GoCardless
      const plaidResponse = await syncAccountBalances();
      const goCardlessResponse = await syncGoCardlessBalances();
      
      let successCount = 0;
      let totalMessage = "";
      
      if (plaidResponse.success) {
        successCount++;
        totalMessage += plaidResponse.message;
      }
      
      if (goCardlessResponse.success) {
        successCount++;
        if (totalMessage) totalMessage += " | ";
        totalMessage += goCardlessResponse.message;
      }
      
      if (successCount > 0) {
        toast.success(totalMessage || "Saldos das contas sincronizados com sucesso", {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Sync failed for all providers");
      }
    } catch (error) {
      console.error("Error syncing balances:", error);
      toast.error("Falha ao sincronizar saldos. Tente novamente.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRemoveAllPlaidData = async () => {
    if (!confirm("Tem certeza de que deseja remover TODAS as conexões e dados do Plaid? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setIsRemoving(true);
      
      const response = await removeAllPlaidData();
      
      if (response.success) {
        toast.success(response.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Remove failed");
      }
    } catch (error) {
      console.error("Error removing Plaid data:", error);
      toast.error("Falha ao remover dados do Plaid. Tente novamente.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveAllGoCardlessData = async () => {
    if (!confirm("Tem certeza de que deseja remover TODAS as conexões e dados do GoCardless? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setIsRemoving(true);
      
      const response = await removeAllGoCardlessData();
      
      if (response.success) {
        toast.success(response.message, {
          icon: <CheckCircle className="h-4 w-4" />,
        });
        onSuccess?.();
      } else {
        throw new Error("Remove failed");
      }
    } catch (error) {
      console.error("Error removing GoCardless data:", error);
      toast.error("Falha ao remover dados do GoCardless. Tente novamente.", {
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const isLoading = isImporting || isSyncing || isRemoving;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoading ? "Processando..." : "Importar transações"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Período de importação
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(7)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Últimos 7 dias
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(30)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Últimos 30 dias
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleImportTransactions(90)}
          disabled={isLoading}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Últimos 90 dias
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSyncBalances}
          disabled={isLoading}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Sincronizar saldos das contas
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Testes e limpeza
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleRemoveAllPlaidData}
          disabled={isLoading}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover todos os dados do Plaid
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleRemoveAllGoCardlessData}
          disabled={isLoading}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remover todos os dados do GoCardless
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}