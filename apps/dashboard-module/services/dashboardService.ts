import { useIntegrationStore } from "@tessera/integration-store";
import type { ToolCall } from "@tessera/integration-store";

/**
 * Model — Dashboard module: chỉ đọc `lastToolCall` từ Integration Layer.
 * Không gọi LLM API (danh mục Exclusions của spec 003: Dashboard không gọi API).
 */
export function readLastToolCall(): ToolCall | null {
  // getState() là sync, không cần React render (vì gọi ở Mô hình, không phải hook)
  return useIntegrationStore.getState().lastToolCall;
}
