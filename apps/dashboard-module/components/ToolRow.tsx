import { Fragment } from "react";
import type { ToolCall } from "../types/dashboard";
import { toPayloadView, type PayloadView } from "../services/payloadFormatter";

const blockStyle = {
  margin: 0,
  padding: "var(--dq-space-2)",
  background: "var(--dq-color-bg)",
  borderRadius: "var(--dq-radius-sm)",
  fontSize: "var(--dq-text-sm)",
  overflow: "auto",
};

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
        <PayloadBlock view={toPayloadView(toolCall.params)} />
      </div>

      <div className="dq-panel" style={{ padding: "var(--dq-space-3)" }}>
        <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
          Kết quả
        </span>
        {toolCall.result === undefined ? (
          <span className="dq-text-muted" style={{ fontSize: "var(--dq-text-sm)" }}>
            Đang chờ kết quả…
          </span>
        ) : (
          <PayloadBlock view={toPayloadView(toolCall.result)} />
        )}
      </div>
    </div>
  );
}

function PayloadBlock({ view }: { view: PayloadView }) {
  if (view.kind === "text") {
    return (
      <pre className="dq-text-muted" style={blockStyle}>
        {view.text}
      </pre>
    );
  }
  return (
    <dl
      className="dq-text-muted"
      style={{
        ...blockStyle,
        display: "grid",
        gridTemplateColumns: "max-content minmax(0, 1fr)",
        gap: "var(--dq-space-1) var(--dq-space-3)",
        margin: 0,
      }}
    >
      {view.entries.map(({ key, value }) => (
        <Fragment key={key}>
          <dt style={{ fontWeight: 700 }}>{key}</dt>
          <dd style={{ margin: 0, wordBreak: "break-word" }}>{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
