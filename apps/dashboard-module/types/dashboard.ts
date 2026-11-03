/**
 * Dashboard module types (UIT.SE.66 003-dashboard-module).
 *
 * Dashboard chỉ đọc state từ Integration Layer (useIntegrationStore). Không gọi LLM API.
 * `lastToolCall` mang thông tin tool Agent vừa gọi; `result` có thể chờ (undefined) trong
 * lúc Agent xử lý để xuất ra trạng thái "đang xử lý".
 */

/** Cơ bản áp từ Integration Layer (integrationStore.ts). Giữ độc lập ở tầng Dashboard. */
export interface ToolCall {
  id: string;
  name: string;
  params: Record<string, unknown>;
  result?: unknown;
  calledAt: string;
}

/** Trạng thái hiển thị của 1 tool call tại tầng Dashboard. */
export interface DashboardState {
  lastToolCall: ToolCall | null;
  /** Tool đang xử lý (result chưa có) → hiển thị placeholder "đang xử lý". */
  isProcessing: boolean;
  /** Tool trả lỗi trong result → hiển thị thông báo lỗi. */
  errorMessage: string | null;
}

/**
 * Message hiển thị bên trong panel (dùng khi có trạng thái lỗi/timeout/processing).
 * type: 'sent' (các tool đã có kết quả), 'processing' (đang xử lý), 'error' (lỗi).
 */
export type MessageType = "sent" | "processing" | "error";

export interface Message {
  id: string;
  type: MessageType;
  text: string;
}
