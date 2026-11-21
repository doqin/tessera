"use client";

import { Fragment, useState } from "react";
import { Badge, Icon, useCopy, useLocale, useT } from "@tessera/shared-ui";
import { isErrorCall, toolCallToJson } from "../services/metrics";
import {
  toPayloadView,
  truncateForPreview,
  type PayloadEntry,
  type PayloadView,
} from "../services/payloadFormatter";
import type { ToolCall } from "../types/dashboard";

const blockStyle = {
  margin: 0,
  padding: "var(--dq-space-3)",
  background: "var(--ts-surface-2)",
  borderRadius: "10px",
  border: "1px solid var(--dq-color-border)",
  fontSize: "0.78rem",
  lineHeight: 1.6,
  overflow: "auto",
} as const;

/** Hàng chi tiết 1 tool call: tên tool + tham số + kết quả. */
export default function ToolRow({ toolCall }: { toolCall: ToolCall }) {
  const t = useT();
  const locale = useLocale();
  const { copied, copy } = useCopy();
  const failed = isErrorCall(toolCall);
  const processing = toolCall.result === undefined;

  const calledAt = (() => {
    const date = new Date(toolCall.calledAt);
    return Number.isNaN(date.getTime())
      ? toolCall.calledAt
      : date.toLocaleString(locale === "vi" ? "vi-VN" : "en-US");
  })();

  return (
    <div className="ts-detail">
      <div className="ts-detail__head">
        <span className="ts-detail__name">{toolCall.name}</span>
        {processing ? (
          <Badge tone="warning">{t("dash.detail.processing")}</Badge>
        ) : (
          <Badge tone={failed ? "danger" : "success"}>
            <Icon name={failed ? "alert" : "check"} size={11} />
            {failed ? t("dash.detail.error") : t("dash.detail.success")}
          </Badge>
        )}
        <button
          type="button"
          className="ts-mini-btn"
          style={{ marginLeft: "auto" }}
          onClick={() => void copy(toolCallToJson(toolCall))}
        >
          <Icon name={copied ? "check" : "copy"} size={13} />
          {copied ? t("dash.copied") : t("dash.detail.copy")}
        </button>
      </div>

      <div className="ts-meta-grid">
        <div className="ts-meta">
          <span>{t("dash.detail.status")}</span>
          <strong>
            {processing ? "…" : failed ? t("dash.detail.error") : t("dash.detail.success")}
          </strong>
        </div>
        <div className="ts-meta">
          <span>{t("dash.detail.duration")}</span>
          <strong>
            {typeof toolCall.durationMs === "number" ? `${toolCall.durationMs} ms` : "—"}
          </strong>
        </div>
        <div className="ts-meta">
          <span>{t("dash.detail.calledAt")}</span>
          <strong style={{ fontVariantNumeric: "normal" }}>{calledAt}</strong>
        </div>
        <div className="ts-meta">
          <span>{t("dash.detail.id")}</span>
          <strong style={{ fontFamily: "var(--dq-font-mono)", fontSize: "0.7rem" }}>
            {toolCall.id.slice(0, 12)}
          </strong>
        </div>
      </div>

      <div className="ts-field">
        <span className="ts-field__label">{t("dash.detail.params")}</span>
        {/* key theo id: tool call mới → khối mount lại và trở về trạng thái thu gọn. */}
        <PayloadBlock key={`${toolCall.id}:params`} view={toPayloadView(toolCall.params)} />
      </div>

      <div className="ts-field">
        <span className="ts-field__label">{t("dash.detail.result")}</span>
        {processing ? (
          <span className="ts-loading">
            <span className="ts-spinner" aria-hidden="true" />
            {t("dash.detail.waiting")}
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
  const t = useT();
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
        <pre style={blockStyle}>{expanded ? view.text : textPreview.text}</pre>
      ) : null}

      {view.kind === "entries" && entryPreviews !== null ? (
        <dl
          style={{
            ...blockStyle,
            display: "grid",
            gridTemplateColumns: "max-content minmax(0, 1fr)",
            gap: "var(--dq-space-1) var(--dq-space-3)",
          }}
        >
          {entryPreviews.map(({ key, value, preview, truncated }) => (
            <Fragment key={key}>
              <dt style={{ fontWeight: 600, color: "var(--dq-color-primary)" }}>{key}</dt>
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
          className="ts-mini-btn"
          style={{ alignSelf: "flex-start" }}
          aria-expanded={expanded}
          onClick={() => setExpanded((previous) => !previous)}
        >
          <Icon
            name="chevron"
            size={12}
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          />
          {expanded ? t("common.collapse") : t("common.expand")}
        </button>
      ) : null}
    </div>
  );
}
