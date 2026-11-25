"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconSeeding, IconRefresh } from "@tabler/icons-react";
import { seedUserData, resetUserData } from "@/actions/dashboard-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function SeedDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSeedData = async (resetFirst: boolean = false) => {
    setIsLoading(true);
    try {
      await seedUserData(resetFirst);
      toast.success("Dados de exemplo criados com sucesso!", {
        description:
          "Seu painel agora tem dados financeiros realistas para explorar.",
      });
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error("Error seeding data:", error);

      if (
        error instanceof Error &&
        error.message.includes("already has financial data")
      ) {
        setShowResetDialog(true);
      } else {
        toast.error("Falha ao criar dados de exemplo", {
          description:
            error instanceof Error
              ? error.message
              : "Tente novamente mais tarde.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndSeed = async () => {
    setShowResetDialog(false);
    await handleSeedData(true);
  };

  const handleResetOnly = async () => {
    setIsLoading(true);
    try {
      await resetUserData();
      toast.success("Dados financeiros redefinidos com sucesso!", {
        description: "Todos os seus dados financeiros foram apagados.",
      });
      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("Falha ao redefinir dados", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => handleSeedData(false)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <>
              <IconRefresh className="h-3 w-3 mr-1 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <IconSeeding className="h-3 w-3 mr-1" />
              Experimentar dados de exemplo
            </>
          )}
        </Button>

        <Button
          onClick={handleResetOnly}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <IconRefresh className="h-3 w-3 mr-1" />
          Redefinir dados
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dados financeiros já existem</AlertDialogTitle>
            <AlertDialogDescription>
              Você já tem dados financeiros na sua conta. O que deseja fazer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Manter dados atuais</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAndSeed}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Substituir por dados de exemplo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
