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

const propertyTypes = [
  { value: "single-family", label: "Casa unifamiliar" },
  { value: "condo", label: "Condomínio" },
  { value: "townhome", label: "Sobrado" },
  { value: "duplex", label: "Duplex" },
  { value: "apartment", label: "Prédio de apartamentos" },
  { value: "commercial", label: "Imóvel comercial" },
  { value: "land", label: "Terreno/lote" },
  { value: "other", label: "Outro" },
];

const realEstateSchema = z.object({
  name: z.string().min(1, "O nome do imóvel é obrigatório"),
  address: z.string().min(1, "O endereço é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  propertyType: z.string().min(1, "O tipo de imóvel é obrigatório"),
  estimatedValue: z.coerce
    .number()
    .min(1, "O valor estimado deve ser maior que 0"),
  purchasePrice: z.coerce.number().min(0).optional().or(z.literal(0)),
  purchaseDate: z.date().optional(),
  squareFootage: z.coerce.number().min(0).optional().or(z.literal(0)),
});

type RealEstateFormData = z.infer<typeof realEstateSchema>;

interface RealEstateAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
}

export function RealEstateAssetDialog({
  open,
  onOpenChange,
  onBack,
}: RealEstateAssetDialogProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RealEstateFormData>({
    resolver: zodResolver(realEstateSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "",
      estimatedValue: 0,
      purchasePrice: 0,
      purchaseDate: undefined,
      squareFootage: 0,
    },
  });

  const onSubmit = async (data: RealEstateFormData) => {
    setLoading(true);
    try {
      // Prepare asset data for the existing createInvestmentAsset function
      const assetData = {
        name: data.name,
        ticker: undefined, // Not applicable for real estate
        assetType: "REAL_ESTATE" as const,
        quantity: 1, // For real estate, quantity is typically 1
        purchasePrice:
          data.purchasePrice && data.purchasePrice > 0
            ? data.purchasePrice
            : undefined,
        currentPrice: data.estimatedValue,
        address: data.address,
        city: data.city,
        state: data.state || undefined,
        zipCode: data.zipCode || undefined,
        metadata: JSON.stringify({
          propertyType: data.propertyType,
          squareFootage:
            data.squareFootage && data.squareFootage > 0
              ? data.squareFootage
              : undefined,
          purchaseDate: data.purchaseDate?.toISOString(),
        }),
      };

      const result = await createInvestmentAsset(assetData);

      if (result.success) {
        // Show success toast
        toast.success("Imóvel adicionado com sucesso! 🏠", {
          description: `${data.name} foi adicionado ao seu portfólio`,
          duration: 4000,
        });

        form.reset();
        onOpenChange(false);
        router.refresh();
      } else {
        // Show error toast
        toast.error("Falha ao adicionar imóvel", {
          description:
            result.error || "Algo deu errado. Tente novamente.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error("Failed to add real estate asset", err);

      // Show error toast for unexpected errors
      toast.error("Erro inesperado", {
        description:
          "Não foi possível adicionar o imóvel. Verifique sua conexão e tente novamente.",
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
            🏠 Adicionar imóvel
          </DialogTitle>
          <DialogDescription>
            Informe os detalhes do seu investimento imobiliário
          </DialogDescription>
        </DialogHeader>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Spinner variant="ring" size={32} />
              <p className="text-sm text-muted-foreground">
                Cadastrando imóvel...
              </p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do imóvel</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex.: Casa da família, Apartamento no centro"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Endereço do imóvel
              </h4>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua Exemplo, 123"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="São Paulo"
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
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado/província (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CA, Oslo, Bayern"
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
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="94102, 0150, 80331"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Detalhes do imóvel
              </h4>

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de imóvel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar tipo de imóvel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor estimado atual</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="500000"
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
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área (m²) (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                          step="1000"
                          placeholder="450000"
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
                  "Adicionar imóvel"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
