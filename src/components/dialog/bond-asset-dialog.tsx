"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { createInvestmentAsset } from "@/actions/asset-actions";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const bondTypes = [
  { value: "treasury", label: "Título do Tesouro" },
  { value: "corporate", label: "Título corporativo" },
  { value: "municipal", label: "Título municipal" },
  { value: "savings", label: "Título de poupança" },
  { value: "international", label: "Título internacional" },
  { value: "high-yield", label: "Título high yield" },
  { value: "other", label: "Outro" },
];

const bondSchema = z.object({
  name: z.string().min(1, "O nome do título é obrigatório"),
  bondType: z.string().min(1, "O tipo de título é obrigatório"),
  issuer: z.string().min(1, "O emissor é obrigatório"),
  faceValue: z.coerce.number().min(1, "O valor nominal deve ser maior que 0"),
  couponRate: z.coerce
    .number()
    .min(0)
    .max(100, "A taxa de cupom deve estar entre 0 e 100%"),
  maturityDate: z.date(),
  currentValue: z.coerce
    .number()
    .min(1, "O valor atual deve ser maior que 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
  cusip: z.string().optional(),
});

type BondFormData = z.infer<typeof bondSchema>;

interface BondAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function BondAssetDialog({ open, onOpenChange, onBack }: BondAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BondFormData>({
    resolver: zodResolver(bondSchema),
    defaultValues: {
      name: "",
      bondType: "",
      issuer: "",
      faceValue: 1000,
      couponRate: 0,
      maturityDate: undefined,
      currentValue: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
      cusip: "",
    },
  });

  const onSubmit = async (data: BondFormData) => {
    setLoading(true);
    try {
      const assetData = {
        name: data.name,
        ticker: data.cusip || undefined,
        assetType: "BOND" as const,
        quantity: 1,
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.currentValue,
        symbol: data.cusip || undefined,
        metadata: JSON.stringify({
          bondType: data.bondType,
          issuer: data.issuer,
          faceValue: data.faceValue,
          couponRate: data.couponRate,
          maturityDate: data.maturityDate.toISOString(),
          purchaseDate: data.purchaseDate?.toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        toast.success("Título adicionado com sucesso! 💰", {
          description: `${data.name} de ${data.issuer} foi adicionado ao seu portfólio`,
          duration: 4000,
        });

        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("Falha ao adicionar título", {
          description:
            result.error || "Algo deu errado. Tente novamente.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add bond asset", err);

      toast.error("Erro inesperado", {
        description:
          "Não foi possível adicionar o título. Verifique sua conexão e tente novamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-1 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            💰 Adicionar investimento em títulos
          </DialogTitle>
          <DialogDescription>
            Informe os detalhes do seu investimento em títulos
          </DialogDescription>
        </DialogHeader>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Adicionando título...
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bond Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex.: Tesouro IPCA 2035, Título Apple"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bond Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Informações do título
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bondType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de título</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar tipo de título" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bondTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emissor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tesouro Nacional, Apple Inc., Prefeitura de SP"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="faceValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor nominal ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="1000"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="couponRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de cupom (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="3.5"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="maturityDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={loading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Escolher data de vencimento</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cusip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUSIP (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="037833100"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Value Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Informações de valor
              </h4>

              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor de mercado atual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1050.00"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Purchase Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Informações de compra (opcional)
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de compra</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="980.00"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de compra</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={loading}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Escolher data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner variant="circle" size={16} />
                    <span>Adicionando...</span>
                  </div>
                ) : (
                  "Adicionar título"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
