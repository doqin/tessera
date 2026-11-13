"use client";

import { loadDashboardRemote } from "./dashboardRemote";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";
import { useRemoteComponent } from "./useRemoteComponent";

function DashboardLoader() {
  const DashboardModule = useRemoteComponent(loadDashboardRemote);
  if (!DashboardModule) {
    return <p style={{ color: "var(--dq-color-muted)" }}>Đang tải Dashboard module…</p>;
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
