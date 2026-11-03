import DashboardModule from "../../components/DashboardModule";

/**
 * Trang chạy độc lập của Dashboard module (dev/test riêng ở :3002).
 *
 * DashboardModule (client component, expose MF) tự subscribe Integration Layer và render
 * DashboardWindow theo state `lastToolCall`. Shell nạp `DashboardModule` qua Module Federation
 * (xem app/dashboard/page.tsx của Shell) khi tích hợp.
 */
export default function Page() {
  return <DashboardModule />;
}
