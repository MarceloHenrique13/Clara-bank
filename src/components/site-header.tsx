import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeSwitcher } from "./mode-switcher";

export function SiteHeader() {
  return (
    <header className="glass-chrome sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold tracking-tight text-primary">
          SkibiriDin
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="default"
            asChild
            size="sm"
            className="hidden sm:flex bg-brand text-brand-foreground hover:bg-brand/90 pressable rounded-full"
          >
            <a href="/dashboard/expense/new">Novo gasto</a>
          </Button>
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
