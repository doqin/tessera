import type { ToolCall } from "../types/dashboard";

/** Format JSON thành chuỗi gọn, fallback xuống String khi không parse được
 * (ví dụ giá trị không JSON-serializable như function/Symbol sẽ trả về undefined). */
function formatPayload(value: unknown): string {
  if (value === null || value === undefined) return String(value);
  if (typeof value === "string") return value;
  try {
    const serialized = JSON.stringify(value, null, 2);
    if (serialized === undefined) return String(value); // không JSON-serializable
    return serialized;
  } catch {
    return String(value);
  }
}

/** Hàng hiển thị 1 tool call: tên tool + tham số + kết quả. */
export default function ToolRow({ toolCall }: { toolCall: ToolCall }) {
  return (
    <div className="dq-stack" style={{ gap: "var(--dq-space-3)" }}>
      <div className="dq-row" style={{ justifyContent: "space-between", gap: "var(--dq-space-2)" }}>
        <span className="dq-text-base" style={{ fontWeight: 700 }}>
          Tool: <span style={{ color: "var(--dq-color-primary)" }}>{toolCall.name}</span>
        </span>
        <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
          {new Date(toolCall.calledAt).toLocaleString("vi-VN")}
        </span>
      </div>

      <div className="dq-panel" style={{ padding: "var(--dq-space-3)" }}>
        <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
          Tham số
        </span>
        <pre
          className="dq-text-muted"
          style={{
            margin: 0,
            padding: "var(--dq-space-2)",
            background: "var(--dq-color-bg)",
            borderRadius: "var(--dq-radius-sm)",
            fontSize: "var(--dq-text-sm)",
            overflow: "auto",
          }}
        >
          {formatPayload(toolCall.params)}
        </pre>
      </div>

      <div className="dq-panel" style={{ padding: "var(--dq-space-3)" }}>
        <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
          Kết quả
        </span>
        <pre
          className="dq-text-muted"
          style={{
            margin: 0,
            padding: "var(--dq-space-2)",
            background: "var(--dq-color-bg)",
            borderRadius: "var(--dq-radius-sm)",
            fontSize: "var(--dq-text-sm)",
            overflow: "auto",
          }}
        >
          {formatPayload(toolCall.result)}
        </pre>
      </div>
    </div>
  );
}
