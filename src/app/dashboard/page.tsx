import {
  SuspendedHeaderSection,
  SuspendedMetricsSection,
  SuspendedAnalyticsSection,
  SuspendedInsightsSection,
  SuspendedTransactionSection,
} from "@/components/dashboard/async-components";
import { MobileHome } from "@/components/mobile/mobile-home";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function MobileHomeFallback() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pt-4 md:hidden">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-3xl" />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <div className="md:hidden">
        <Suspense fallback={<MobileHomeFallback />}>
          <MobileHome />
        </Suspense>
      </div>

      <div className="hidden flex-col gap-6 p-6 md:flex">
        <SuspendedHeaderSection />
        <SuspendedMetricsSection />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SuspendedAnalyticsSection />
          <SuspendedInsightsSection />
        </div>

        <SuspendedTransactionSection />
      </div>
    </>
  );
}
