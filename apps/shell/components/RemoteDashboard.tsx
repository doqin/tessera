"use client";

import { useT } from "@tessera/shared-ui";
import { loadDashboardRemote } from "./dashboardRemote";
import { ModuleLoading } from "./ModuleLoading";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";
import { useRemoteComponent } from "./useRemoteComponent";

function DashboardLoader() {
  const t = useT();
  const DashboardModule = useRemoteComponent(loadDashboardRemote);
  if (!DashboardModule) {
    return <ModuleLoading label={t("loading.dashboard")} />;
  }
  return <DashboardModule />;
}

/** Mount Dashboard module (remote Module Federation) vào vùng nội dung route `/dashboard`. */
export function RemoteDashboard() {
  return (
    <RemoteModuleBoundary moduleName="dashboard_module">
      <DashboardLoader />
    </RemoteModuleBoundary>
  );
}
