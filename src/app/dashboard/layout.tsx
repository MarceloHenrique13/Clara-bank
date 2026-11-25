import { MobileBottomNav } from "@/components/mobile/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <div className="flex flex-1 flex-col pb-28">{children}</div>
      <MobileBottomNav />
    </div>
  );
}
