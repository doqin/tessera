/**
 * Integration Layer types (UIT.SE.66 — specs/001-shell-app/spec.md §4, specs/004-ui-ux-redesign).
 *
 * `ToolCall` là dữ liệu duy nhất đi từ Chat module sang Dashboard module; `Locale` đi từ Shell
 * (bộ chuyển ngôn ngữ trên header) xuống mọi module đang mount.
 */

/** Ngôn ngữ hiển thị của toàn bộ UI (Shell + các remote). */
export type Locale = "vi" | "en";

/** Trạng thái thực thi của một tool call. */
export type ToolCallStatus = "success" | "error";

export interface ToolCall {
  id: string;
  name: string;
  params: Record<string, unknown>;
  result?: unknown;
  calledAt: string;
  /** Thời gian thực thi (ms) — Chat module đo và ghi lại; Dashboard dùng để tính KPI. */
  durationMs?: number;
  status?: ToolCallStatus;
}

export interface NavState {
  currentRoute: string;
}

/**
 * Hội thoại trong phiên hiện tại. Chat module sở hữu nội dung; Integration Layer giữ bản sao để
 * transcript sống sót khi remote bị unmount (điều hướng sang route khác) — specs/002 §9.
 */
export type ChatRole = "user" | "agent";
export type ChatMessageStatus = "sent" | "error" | "interrupted";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  createdAt: string;
  toolName?: string;
  durationMs?: number;
  /** Kết quả tool đã chạy — Chat hiển thị ngay trong transcript, không bắt người dùng sang Dashboard. */
  toolResult?: unknown;
  toolStatus?: ToolCallStatus;
}
