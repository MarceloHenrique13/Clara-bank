"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Building2,
  AlertCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BANKS, searchBanks, type BankInfo } from "@/data/banks";
import { createManualFinancialAccount } from "@/actions/financial-actions";

const PRIMARY_BANKS_COUNT = 8;

interface BankConnectionModalProps {
  onSuccess?: () => void;
}

export function PlaidLinkModal({ onSuccess }: BankConnectionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankInfo | null>(null);
  const [showOthers, setShowOthers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryBanks = BANKS.slice(0, PRIMARY_BANKS_COUNT);
  const otherBanks = BANKS.slice(PRIMARY_BANKS_COUNT);

  const filteredBanks = searchQuery
    ? searchBanks(searchQuery)
    : showOthers
      ? BANKS
      : primaryBanks;

  const handleBankSelect = (bank: BankInfo) => {
    setSelectedBank(bank);
    setSearchQuery(bank.name);
  };

  const handleConfirmBank = async () => {
    if (!selectedBank) {
      toast.error("Selecione um banco primeiro");
      return;
    }

    setIsSubmitting(true);
    const result = await createManualFinancialAccount({
      bankId: selectedBank.id,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`Conta ${result.name} cadastrada`);
    setIsOpen(false);
    setSelectedBank(null);
    setSearchQuery("");
    setShowOthers(false);
    onSuccess?.();
  };

  const getBankIcon = (IconComponent: typeof Building2) => {
    return <IconComponent className="h-6 w-6 text-muted-foreground" />;
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Major Bank":
        return "default";
      case "Credit Card":
        return "secondary";
      case "Credit Union":
        return "outline";
      case "Online Bank":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getBankTypeLabel = (type: string) => {
    switch (type) {
      case "Major Bank":
        return "Banco tradicional";
      case "Credit Card":
        return "Cartão de crédito";
      case "Credit Union":
        return "Cooperativa";
      case "Online Bank":
        return "Banco digital";
      case "Regional Bank":
        return "Banco regional";
      default:
        return type;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setShowOthers(false);
          setSearchQuery("");
          setSelectedBank(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Selecione seu banco
          </DialogTitle>
          <DialogDescription>
            Escolha a instituição financeira da conta que você quer cadastrar
            manualmente no SkibiriDin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="bank-search" className="sr-only">
              Buscar banco
            </label>
            <Input
              id="bank-search"
              name="bank-search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Busque seu banco (Nubank, Itaú, Inter…)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedBank ? (
            <div className="flex flex-col items-center gap-4 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="text-center">
                <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">
                  Banco selecionado: {selectedBank.displayName}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  Confirme para cadastrar sua conta {selectedBank.displayName} manualmente
                </p>
                <Badge variant="outline" className="text-xs">
                  Brasil
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSelectedBank(null);
                    setSearchQuery("");
                  }}
                  variant="outline"
                  size="lg"
                >
                  Escolher outro banco
                </Button>
                <Button
                  onClick={handleConfirmBank}
                  size="lg"
                  className="min-w-[200px]"
                  disabled={isSubmitting}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  {isSubmitting
                    ? "Cadastrando…"
                    : `Confirmar ${selectedBank.displayName}`}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-lg border-2 border-dashed">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Selecione seu banco</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Busque e selecione seu banco na lista abaixo para continuar
                </p>
              </div>
              <Button
                disabled
                size="lg"
                className="min-w-[200px] opacity-50"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Selecione um banco primeiro
              </Button>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-3">Bancos brasileiros</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => handleBankSelect(bank)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    selectedBank?.id === bank.id
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {getBankIcon(bank.icon)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{bank.displayName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant={getBadgeVariant(bank.type) as "default" | "secondary" | "outline"}
                        className="text-xs"
                      >
                        {getBankTypeLabel(bank.type)}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}

              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setShowOthers((prev) => !prev)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed transition-colors text-left hover:bg-muted/50"
                >
                  <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">Outros</div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      {showOthers ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Ocultar {otherBanks.length} bancos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Ver mais {otherBanks.length} bancos
                        </>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>

            {filteredBanks.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum banco encontrado para &quot;{searchQuery}&quot;</p>
                <p className="text-sm">
                  Tente outro nome, como Nubank, Itaú ou Caixa.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Cadastro manual
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Por enquanto as contas são cadastradas na mão — sem importar
                  extrato do internet banking. Escolha o banco e depois informe
                  saldo e movimentações.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
