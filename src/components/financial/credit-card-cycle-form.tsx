"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCreditCardCycle } from "@/actions/expense-actions";
import {
  getOpenStatementCycle,
  formatCycleDayLabel,
  isValidCycleDay,
} from "@/lib/credit-card-cycle";

type CreditCardCycleFormProps = {
  accountId: string;
  statementClosingDay?: number | null;
  paymentDueDay?: number | null;
};

export function CreditCardCycleForm({
  accountId,
  statementClosingDay,
  paymentDueDay,
}: CreditCardCycleFormProps) {
  const [closingDay, setClosingDay] = React.useState(
    String(statementClosingDay ?? "")
  );
  const [dueDay, setDueDay] = React.useState(String(paymentDueDay ?? ""));
  const [saving, setSaving] = React.useState(false);

  const closingNum = Number(closingDay);
  const dueNum = Number(dueDay);
  const preview =
    isValidCycleDay(closingNum) && isValidCycleDay(dueNum)
      ? getOpenStatementCycle({
          statementClosingDay: closingNum,
          paymentDueDay: dueNum,
        })
      : null;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidCycleDay(closingNum) || !isValidCycleDay(dueNum)) {
      toast.error("Use dias entre 1 e 28");
      return;
    }

    setSaving(true);
    const result = await updateCreditCardCycle({
      accountId,
      statementClosingDay: closingNum,
      paymentDueDay: dueNum,
    });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success("Ciclo da fatura atualizado");
  }

  return (
    <form
      onSubmit={onSave}
      className="space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4"
    >
      <div>
        <h3 className="text-sm font-semibold">Ciclo da fatura</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          O valor em aberto soma os gastos entre um fechamento e o próximo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="closing-day">Dia de fechamento</Label>
          <Input
            id="closing-day"
            type="number"
            min={1}
            max={28}
            inputMode="numeric"
            placeholder="Ex.: 10"
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="due-day">Dia de vencimento</Label>
          <Input
            id="due-day"
            type="number"
            min={1}
            max={28}
            inputMode="numeric"
            placeholder="Ex.: 17"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
        </div>
      </div>

      {preview && (
        <p className="text-xs text-muted-foreground">
          Próximo fechamento {formatCycleDayLabel(preview.nextClosingDate)} ·
          Vencimento {formatCycleDayLabel(preview.dueDate)}
        </p>
      )}

      <Button
        type="submit"
        size="sm"
        className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
        disabled={saving}
      >
        {saving ? "Salvando..." : "Salvar ciclo"}
      </Button>
    </form>
  );
}
