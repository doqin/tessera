"use client";

import { useDashboardViewModel } from "../hooks/useDashboardViewModel";
import DashboardWindow from "./DashboardWindow";

/**
 * DashboardModule.tsx — Client Component, được expose qua Module Federation (`./DashboardModule`).
 *
 * - "use client": bắt buộc vì Shell nạp remote với `ssr: false` và cần hooks/store.
 * - ViewModel subscribe store dùng chung (Integration Layer), tự render khi `lastToolCall` thay đổi.
 */
export default function DashboardModule() {
  const state = useDashboardViewModel();

  return <DashboardWindow state={state} />;
}
