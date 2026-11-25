"use client";

import { useState, ReactNode } from "react";
import {
  TabNavigation,
  TabNavigationLink,
} from "@/components/ui/tab-navigation";

interface FinancialTabsProps {
  header: ReactNode;
  accountsContent: ReactNode;
  overviewContent: ReactNode;
}

export function FinancialTabs({
  header,
  accountsContent,
  overviewContent,
}: FinancialTabsProps) {
  const [activeTab, setActiveTab] = useState<"accounts" | "overview">(
    "accounts"
  );

  return (
    <div className="space-y-6">
      {/* Header (shown on all tabs) */}
      {header}

      {/* Tab Navigation */}
      <TabNavigation>
        <TabNavigationLink
          active={activeTab === "accounts"}
          onClick={() => setActiveTab("accounts")}
          className="cursor-pointer"
        >
          Contas
        </TabNavigationLink>
        <TabNavigationLink
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          className="cursor-pointer"
        >
          Visão geral
        </TabNavigationLink>
      </TabNavigation>

      {/* Tab Content */}
      {activeTab === "accounts" && (
        <div className="space-y-6">{accountsContent}</div>
      )}

      {activeTab === "overview" && (
        <div className="space-y-6">{overviewContent}</div>
      )}
    </div>
  );
}
