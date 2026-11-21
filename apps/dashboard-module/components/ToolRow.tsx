import { Fragment, useState } from "react";
import type { ToolCall } from "../types/dashboard";
import {
  toPayloadView,
  truncateForPreview,
  type PayloadEntry,
  type PayloadView,
} from "../services/payloadFormatter";

const blockStyle = {
  margin: 0,
  padding: "var(--dq-space-2)",
  background: "var(--dq-color-bg)",
  borderRadius: "var(--dq-radius-sm)",
  fontSize: "var(--dq-text-sm)",
  overflow: "auto",
};

const toggleStyle = {
  alignSelf: "flex-start",
  padding: "var(--dq-space-1) var(--dq-space-3)",
  fontSize: "var(--dq-text-sm)",
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
        {/* key theo id: tool call mới → khối mount lại và trở về trạng thái thu gọn. */}
        <PayloadBlock key={`${toolCall.id}:params`} view={toPayloadView(toolCall.params)} />
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
          <PayloadBlock key={`${toolCall.id}:result`} view={toPayloadView(toolCall.result)} />
        )}
      </div>
    </div>
  );
}

interface PreviewEntry extends PayloadEntry {
  preview: string;
  truncated: boolean;
}

/**
 * Khối hiển thị `parameters`/`result` (FR3/AC3).
 * - Mặc định thu gọn: giá trị dài hơn `PAYLOAD_PREVIEW_LIMIT` ký tự bị cắt + "…".
 * - Có nút "Mở rộng"/"Thu gọn" mở rộng **toàn bộ** giá trị dài trong khối này.
 * - Khối không có giá trị dài thì không hiện nút.
 */
function PayloadBlock({ view }: { view: PayloadView }) {
  const [expanded, setExpanded] = useState(false);

  const textPreview = view.kind === "text" ? truncateForPreview(view.text) : null;
  const entryPreviews: PreviewEntry[] | null =
    view.kind === "entries"
      ? view.entries.map((entry) => {
          const { text, truncated } = truncateForPreview(entry.value);
          return { ...entry, preview: text, truncated };
        })
      : null;
  const hasTruncated =
    textPreview !== null ? textPreview.truncated : entryPreviews!.some((entry) => entry.truncated);

  return (
    <div className="dq-stack" style={{ gap: "var(--dq-space-2)" }}>
      {view.kind === "text" && textPreview !== null ? (
        <pre className="dq-text-muted" style={blockStyle}>
          {expanded ? view.text : textPreview.text}
        </pre>
      ) : null}

      {view.kind === "entries" && entryPreviews !== null ? (
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
          {entryPreviews.map(({ key, value, preview, truncated }) => (
            <Fragment key={key}>
              <dt style={{ fontWeight: 700 }}>{key}</dt>
              <dd style={{ margin: 0, wordBreak: "break-word" }}>
                {expanded || !truncated ? value : preview}
              </dd>
            </Fragment>
          ))}
        </dl>
      ) : null}

      {hasTruncated ? (
        <button
          type="button"
          className="dq-btn dq-btn--secondary"
          style={toggleStyle}
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          {expanded ? "Thu gọn" : "Mở rộng"}
        </button>
      ) : null}
    </div>
  );
}
