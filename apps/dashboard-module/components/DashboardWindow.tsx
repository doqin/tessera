"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, useT } from "@tessera/shared-ui";
import type { DashboardState, ToolFilter } from "../types/dashboard";
import EmptyState from "./EmptyState";
import ToolRow from "./ToolRow";
import ToolTimeline from "./ToolTimeline";

const FILTERS: ToolFilter[] = ["all", "success", "error"];

export interface DashboardWindowProps {
  state: DashboardState;
  onSelect?: (id: string) => void;
  onFilterChange?: (filter: ToolFilter) => void;
  onQueryChange?: (query: string) => void;
  onClear?: () => void;
}

/**
 * DashboardWindow — KPI + dòng thời gian tool call + panel chi tiết.
 * - Chưa có tool nào → EmptyState (giữ nguyên câu "Chưa có tool nào được gọi").
 * - `result === undefined` → banner "đang xử lý" + placeholder ở khối kết quả.
 */
export default function DashboardWindow({
  state,
  onSelect,
  onFilterChange,
  onQueryChange,
  onClear,
}: DashboardWindowProps) {
  const t = useT();
  const { history, visible, selected, metrics, filter, query, isProcessing, errorMessage } = state;
  const [armed, setArmed] = useState(false);
  const disarmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (disarmTimer.current) clearTimeout(disarmTimer.current);
    },
    [],
  );

  const handleClear = () => {
    if (!armed) {
      setArmed(true);
      disarmTimer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    if (disarmTimer.current) clearTimeout(disarmTimer.current);
    setArmed(false);
    onClear?.();
  };

  const filterLabel: Record<ToolFilter, string> = {
    all: t("dash.filter.all"),
    success: t("dash.filter.success"),
    error: t("dash.filter.error"),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="ts-page__head">
        <div>
          <h1 className="ts-page__title">{t("dash.title")}</h1>
          <p className="ts-page__sub">{t("dash.sub")}</p>
        </div>
        {history.length > 0 ? (
          <div className="ts-page__actions">
            <button
              type="button"
              className={armed ? "dq-btn dq-btn--danger" : "dq-btn dq-btn--secondary"}
              onClick={handleClear}
              aria-live="polite"
            >
              <Icon name="trash" size={14} />
              {armed ? t("dash.clearConfirm") : t("dash.clear")}
            </button>
          </div>
        ) : null}
      </div>

      <div className="ts-kpis">
        <Kpi
          hero
          label={t("dash.kpi.total")}
          value={String(metrics.total)}
          hint={t("dash.kpi.totalHint")}
        />
        <div className="ts-kpi-strip">
          <Kpi
            label={t("dash.kpi.success")}
            value={`${metrics.successRate}%`}
            hint={t("dash.kpi.successHint", { ok: metrics.success, failed: metrics.failed })}
          />
          <Kpi
            label={t("dash.kpi.latency")}
            value={metrics.avgLatencyMs === null ? "—" : `${metrics.avgLatencyMs} ms`}
            hint={t("dash.kpi.latencyHint")}
          />
          <Kpi
            label={t("dash.kpi.tools")}
            value={String(metrics.distinctTools)}
            hint={t("dash.kpi.toolsHint")}
          />
        </div>
      </div>

      {history.length === 0 ? (
        <div className="ts-card" style={{ flex: 1 }}>
          <EmptyState />
        </div>
      ) : (
        <div className="ts-dash">
          <div className="ts-card">
            <div className="ts-toolbar">
              <div className="ts-toolbar__search">
                <Icon name="search" size={14} />
                <input
                  className="dq-input"
                  value={query}
                  onChange={(event) => onQueryChange?.(event.target.value)}
                  placeholder={t("dash.search")}
                  aria-label={t("dash.search")}
                />
              </div>
              <div className="ts-seg" role="group" aria-label={t("dash.filter.label")}>
                {FILTERS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="ts-seg__btn"
                    aria-pressed={filter === option}
                    onClick={() => onFilterChange?.(option)}
                  >
                    {filterLabel[option]}
                  </button>
                ))}
              </div>
            </div>
            <ToolTimeline calls={visible} selectedId={selected?.id ?? null} onSelect={onSelect} />
          </div>

          <div className="ts-card">
            {isProcessing ? <ProcessingIndicator /> : null}
            {errorMessage ? <ErrorIndicator message={errorMessage} /> : null}
            {selected ? (
              <ToolRow toolCall={selected} />
            ) : (
              <p
                style={{
                  padding: "var(--dq-space-6)",
                  color: "var(--dq-color-muted)",
                  fontSize: "var(--dq-text-sm)",
                }}
              >
                {t("dash.select")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  hero = false,
}: {
  label: string;
  value: string;
  hint: string;
  hero?: boolean;
}) {
  return (
    <div className={hero ? "ts-kpi ts-kpi--hero" : "ts-kpi"}>
      <span className="ts-kpi__label">{label}</span>
      <span className="ts-kpi__value">{value}</span>
      <span className="ts-kpi__hint">{hint}</span>
    </div>
  );
}

function ProcessingIndicator() {
  const t = useT();
  return (
    <div
      style={{
        padding: "var(--dq-space-3) var(--dq-space-5) 0",
        display: "flex",
        alignItems: "center",
        gap: "var(--dq-space-2)",
        color: "var(--dq-color-warning)",
        fontSize: "var(--dq-text-sm)",
      }}
    >
      <span className="ts-spinner" aria-hidden="true" />
      {t("dash.detail.processing")}
    </div>
  );
}

function ErrorIndicator({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        margin: "var(--dq-space-3) var(--dq-space-5) 0",
        padding: "var(--dq-space-2) var(--dq-space-3)",
        border: "1px solid color-mix(in srgb, var(--dq-color-danger) 35%, transparent)",
        borderRadius: "10px",
        background: "color-mix(in srgb, var(--dq-color-danger) 8%, transparent)",
        color: "var(--dq-color-danger-text)",
        fontSize: "var(--dq-text-sm)",
      }}
    >
      {message}
    </div>
  );
}
