import type { DashboardState } from "../types/dashboard";
import EmptyState from "./EmptyState";
import ToolRow from "./ToolRow";

/**
 * DashboardWindow — panel chính: hiển thị tool call gần nhất từ Integration Layer.
 * - `lastToolCall` null → EmptyState ("Chưa có tool nào được gọi").
 * - `lastToolCall.result === undefined` → placeholder "đang xử lý".
 * - Có dữ liệu → ToolRow (tool name + parameters + result).
 */
export default function DashboardWindow({ state }: { state: DashboardState }) {
  const { lastToolCall, isProcessing, errorMessage } = state;

  return (
    <div className="dq-stack" style={{ minHeight: "100%" }}>
      {lastToolCall === null ? (
        <EmptyState />
      ) : (
        <>
          {isProcessing ? <ProcessingIndicator /> : null}
          {errorMessage ? <ErrorIndicator message={errorMessage} /> : null}
          <ToolRow toolCall={lastToolCall} />
        </>
      )}
    </div>
  );
}

function ProcessingIndicator() {
  return (
    <div className="dq-panel" style={{ padding: "var(--dq-space-4)" }}>
      <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
        Đang xử lý… (tool Agent chưa trả kết quả)
      </span>
    </div>
  );
}

function ErrorIndicator({ message }: { message: string }) {
  return (
    <div
      className="dq-panel"
      style={{
        padding: "var(--dq-space-4)",
        background: "var(--dq-color-danger-text)",
        color: "#fff",
      }}
    >
      <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
        {message}
      </span>
    </div>
  );
}
