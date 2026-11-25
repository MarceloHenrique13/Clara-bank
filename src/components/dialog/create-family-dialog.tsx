"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createFamily } from "@/actions/user-actions";
import { useRouter } from "next/navigation";

// Form validation schema
const createFamilySchema = z.object({
  name: z
    .string()
    .min(1, "O nome da família é obrigatório")
    .min(2, "O nome da família deve ter pelo menos 2 caracteres")
    .max(50, "O nome da família não pode exceder 50 caracteres"),
  description: z
    .string()
    .max(200, "A descrição não pode exceder 200 caracteres")
    .optional(),
  currency: z.string().min(1, "A moeda é obrigatória"),
  timezone: z.string().min(1, "O fuso horário é obrigatório"),
});

type CreateFamilyFormData = z.infer<typeof createFamilySchema>;

// Common currencies for the dropdown
const currencies = [
  { value: "USD", label: "USD - Dólar americano" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - Libra esterlina" },
  { value: "JPY", label: "JPY - Iene japonês" },
  { value: "CAD", label: "CAD - Dólar canadense" },
  { value: "AUD", label: "AUD - Dólar australiano" },
  { value: "CHF", label: "CHF - Franco suíço" },
  { value: "CNY", label: "CNY - Yuan chinês" },
  { value: "SEK", label: "SEK - Coroa sueca" },
  { value: "NOK", label: "NOK - Coroa norueguesa" },
];

// Common timezones for the dropdown
const timezones = [
  { value: "UTC", label: "UTC - Tempo Universal Coordenado" },
  { value: "America/New_York", label: "EST - Horário do Leste (EUA)" },
  { value: "America/Chicago", label: "CST - Horário Central (EUA)" },
  { value: "America/Denver", label: "MST - Horário das Montanhas (EUA)" },
  { value: "America/Los_Angeles", label: "PST - Horário do Pacífico (EUA)" },
  { value: "Europe/London", label: "GMT - Horário de Greenwich" },
  { value: "Europe/Paris", label: "CET - Horário da Europa Central" },
  { value: "Europe/Stockholm", label: "CET - Estocolmo" },
  { value: "Asia/Tokyo", label: "JST - Horário Padrão do Japão" },
  { value: "Asia/Shanghai", label: "CST - Horário Padrão da China" },
  { value: "Australia/Sydney", label: "AEST - Horário do Leste Australiano" },
];

interface CreateFamilyDialogProps {
  trigger?: React.ReactNode;
}

export function CreateFamilyDialog({ trigger }: CreateFamilyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<CreateFamilyFormData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      name: "",
      description: "",
      currency: "USD",
      timezone: "UTC",
    },
  });

  const onSubmit = async (data: CreateFamilyFormData) => {
    console.log("🏠 Creating family with data:", data);
    setIsSubmitting(true);
    setError("");

    try {
      const result = await createFamily(data);
      console.log("📥 Family creation result:", result);

      if (result.success) {
        // Close dialog and reset form
        setOpen(false);
        form.reset();

        // Refresh the page to show the new family
        router.refresh();
      } else {
        setError(result.error || "Falha ao criar família");
      }
    } catch (err) {
      console.error("💥 Error creating family:", err);
      setError("Ocorreu um erro inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Criar família
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar nova família</DialogTitle>
          <DialogDescription>
            Configure uma nova família para gerenciar as finanças juntos.
            Você será o proprietário e poderá convidar outras pessoas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da família *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Família Silva"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Visível para todos os membros da família.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição dos objetivos financeiros da família..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição opcional da família (máx. 200 caracteres).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar moeda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
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
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuso horário *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar fuso horário" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem
                            key={timezone.value}
                            value={timezone.value}
                          >
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar família"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
