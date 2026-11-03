"use client";

import dynamic from "next/dynamic";
import { loadDashboardRemote } from "./dashboardRemote";
import { RemoteModuleBoundary } from "./RemoteModuleBoundary";

const DashboardModule = dynamic(loadDashboardRemote, {
  ssr: false,
  // next/dynamic báo lỗi nạp qua prop `error` của `loading` thay vì throw — ném lại để
  // RemoteModuleBoundary bắt được (spec FR5/AC5).
  loading: ({ error }) => {
    if (error) throw error;
    return <p style={{ color: "var(--dq-color-muted)" }}>Đang tải Dashboard module…</p>;
  },
});

/** Mount Dashboard module (remote Module Federation) vào vùng nội dung route `/dashboard`. */
export function RemoteDashboard() {
  return (
    <RemoteModuleBoundary moduleName="dashboard_module">
      <DashboardModule />
    </RemoteModuleBoundary>
  );
}
