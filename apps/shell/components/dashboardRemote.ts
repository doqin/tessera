/**
 * Điểm nạp duy nhất của remote `dashboard_module` (Module Federation). Tách riêng để unit test mock
 * được (jsdom không resolve được remote); việc nạp thật được kiểm chứng bằng browser/integration
 * test (specs/003-dashboard-module/tasks.md T015).
 */
export const loadDashboardRemote = () => import("dashboard_module/DashboardModule");
