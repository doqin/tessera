"use client";

import { useLocale, useT } from "@tessera/shared-ui";
import { isErrorCall } from "../services/metrics";
import type { ToolCall } from "../types/dashboard";

export interface ToolTimelineProps {
  calls: ToolCall[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

function timeLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Dòng thời gian các tool Agent đã gọi trong phiên (mới nhất ở trên). */
export default function ToolTimeline({ calls, selectedId, onSelect }: ToolTimelineProps) {
  const t = useT();
  const locale = useLocale();

  if (calls.length === 0) {
    return (
      <p
        style={{
          padding: "var(--dq-space-4)",
          color: "var(--dq-color-muted)",
          fontSize: "var(--dq-text-sm)",
        }}
      >
        {t("dash.noMatch")}
      </p>
    );
  }

  return (
    <div className="ts-timeline" aria-label={t("dash.timeline")}>
      {calls.map((call, index) => {
        const failed = isErrorCall(call);
        const isLast = index === calls.length - 1;
        return (
          <button
            key={call.id}
            type="button"
            className="ts-timeline__item"
            aria-current={selectedId === call.id ? "true" : undefined}
            onClick={() => onSelect?.(call.id)}
          >
            <span className="ts-timeline__rail" aria-hidden="true">
              <span
                className={failed ? "ts-timeline__dot ts-timeline__dot--error" : "ts-timeline__dot"}
              />
              {isLast ? null : <span className="ts-timeline__line" />}
            </span>
            <span className="ts-timeline__content">
              <span className="ts-timeline__name">{call.name}</span>
              <span className="ts-timeline__meta">
                {timeLabel(call.calledAt, locale)}
                {typeof call.durationMs === "number" ? ` · ${call.durationMs} ms` : ""}
                {failed ? ` · ${t("dash.detail.error")}` : ""}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
