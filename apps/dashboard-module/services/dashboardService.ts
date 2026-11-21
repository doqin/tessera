import { useIntegrationStore } from "@tessera/integration-store";
import type { ToolCall } from "@tessera/integration-store";

/**
 * Model — Dashboard module: chỉ đọc state từ Integration Layer.
 * Không gọi LLM API (danh mục Exclusions của spec 003: Dashboard không gọi API).
 */
export function readLastToolCall(): ToolCall | null {
  return useIntegrationStore.getState().lastToolCall;
}

/** Lịch sử tool call của phiên (timeline + KPI). */
export function readToolCallHistory(): ToolCall[] {
  return useIntegrationStore.getState().toolCallHistory;
}

/** Xoá lịch sử trong Integration Layer (nút "Xoá lịch sử" trên Dashboard). */
export function clearToolCallHistory(): void {
  useIntegrationStore.getState().clearToolCallHistory();
}
