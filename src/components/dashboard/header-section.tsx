import { Badge } from "@/components/ui/badge";
import { SeedDataButton } from "./seed-data-button";

export function HeaderSection() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Início</h1>
        <div className="flex items-center gap-2">
          <SeedDataButton />
          <span className="text-sm text-muted-foreground">Visão geral</span>
          <Badge
            variant="outline"
            className="border-transparent bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Melhorar plano
          </Badge>
        </div>
      </div>
    </div>
  );
}
