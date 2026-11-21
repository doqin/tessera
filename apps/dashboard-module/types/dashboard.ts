/**
 * Dashboard module types (UIT.SE.66 003-dashboard-module + 004-ui-ux-redesign).
 *
 * Dashboard chỉ đọc state từ Integration Layer (`useIntegrationStore`). Không gọi LLM API.
 * `lastToolCall` là tool Agent vừa gọi; `toolCallHistory` là toàn bộ lịch sử trong phiên.
 */

/** Cơ bản lấy từ Integration Layer. Giữ độc lập ở tầng Dashboard. */
export interface ToolCall {
  id: string;
  name: string;
  params: Record<string, unknown>;
  result?: unknown;
  calledAt: string;
  durationMs?: number;
  status?: "success" | "error";
}

export type ToolFilter = "all" | "success" | "error";

export interface DashboardMetrics {
  total: number;
  success: number;
  failed: number;
  successRate: number;
  avgLatencyMs: number | null;
  distinctTools: number;
}

/** Trạng thái hiển thị của 1 tool call tại tầng Dashboard. */
export interface DashboardState {
  lastToolCall: ToolCall | null;
  /** Toàn bộ lịch sử (mới nhất ở cuối mảng). */
  history: ToolCall[];
  /** Lọc theo kết quả + tìm kiếm (đã áp dụng). */
  visible: ToolCall[];
  selected: ToolCall | null;
  metrics: DashboardMetrics;
  filter: ToolFilter;
  query: string;
  /** Tool đang xử lý (result chưa có) → hiển thị placeholder "đang xử lý". */
  isProcessing: boolean;
  /** Tool trả lỗi trong result → hiển thị thông báo lỗi. */
  errorMessage: string | null;
}
