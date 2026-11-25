"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  IconCreditCard,
  IconHelp,
  IconHome,
  IconPigMoney,
  IconSearch,
  IconSettings,
  IconWallet,
} from "@tabler/icons-react";
import { BrandMark } from "@/components/brand-mark";
import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUserSkeleton } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// better-auth/react hooks break under RSC SSR when better-auth is a
// serverExternalPackage (needed to avoid Turbopack bun-sqlite crash).
const NavUser = dynamic(
  () => import("@/components/nav-user").then((m) => m.NavUser),
  { ssr: false, loading: () => <NavUserSkeleton /> }
);

const data = {
  navMain: [
    {
      title: "Início",
      url: "/dashboard",
      icon: IconHome,
      exact: true,
    },
    {
      title: "Contas",
      url: "/dashboard/financial",
      icon: IconWallet,
    },
    {
      title: "Gastos",
      url: "/dashboard/transactions",
      icon: IconCreditCard,
    },
  ],
  navSecondary: [
    {
      title: "Perfil",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  accounts: [
    {
      name: "Conta corrente",
      url: "#",
      icon: IconWallet,
    },
    {
      name: "Poupança",
      url: "#",
      icon: IconPigMoney,
    },
    {
      name: "Cartão de crédito",
      url: "#",
      icon: IconCreditCard,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props} className="glass-chrome">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <BrandMark href="/dashboard" size={32} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.accounts} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
