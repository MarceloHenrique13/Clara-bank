"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeGoCardlessConnection } from "@/actions/gocardless-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function GoCardlessCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage("Concluindo conexão bancária...");

        const storedRequisitions = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("gocardless_bank_")) {
            const requisitionId = key.replace("gocardless_bank_", "");
            storedRequisitions.push({
              id: requisitionId,
              bankInfo: JSON.parse(localStorage.getItem(key) || "{}"),
            });
          }
        }

        if (storedRequisitions.length === 0) {
          throw new Error(
            "Nenhuma conexão bancária pendente encontrada. Tente conectar novamente."
          );
        }

        const { id: requisitionId, bankInfo } =
          storedRequisitions[storedRequisitions.length - 1];

        if (!requisitionId) {
          throw new Error(
            "ID de requisição ausente. Tente conectar novamente."
          );
        }

        const result = await completeGoCardlessConnection(
          requisitionId,
          bankInfo
        );

        if (result.success) {
          setStatus("success");
          setMessage(
            `${result.accounts.length} conta(s) conectada(s) com sucesso de ${bankInfo.displayName}`
          );
          toast.success(result.message);

          localStorage.removeItem(`gocardless_bank_${requisitionId}`);

          setTimeout(() => {
            router.push("/dashboard/financial");
          }, 2000);
        } else {
          throw new Error("Falha ao concluir a conexão bancária");
        }
      } catch (error) {
        console.error("GoCardless callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado"
        );
        toast.error("Falha ao conectar conta bancária");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push("/dashboard/financial");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">
              {status === "loading" && "Conectando sua conta bancária"}
              {status === "success" && "Conta bancária conectada!"}
              {status === "error" && "Falha na conexão"}
            </h1>

            <p className="text-muted-foreground">{message}</p>
          </div>

          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Tentar novamente
              </Button>
              <p className="text-sm text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-3">
              <p className="text-sm text-green-600">
                Redirecionando para o painel financeiro do SkibiriDin...
              </p>
              <Button
                onClick={() => router.push("/dashboard/financial")}
                variant="outline"
              >
                Ir para o painel agora
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Não feche esta página
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoCardlessCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Conectando sua conta bancária
                </h1>
                <p className="text-muted-foreground">
                  Aguarde enquanto processamos sua conexão...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <GoCardlessCallbackContent />
    </Suspense>
  );
}
