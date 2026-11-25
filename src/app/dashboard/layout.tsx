import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/mobile/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <div className="hidden md:contents">
        <AppSidebar variant="inset" />
      </div>
      <SidebarInset>
        <div className="hidden md:block">
          <SiteHeader />
        </div>
        <div className="flex flex-1 flex-col pb-28 md:pb-0">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
