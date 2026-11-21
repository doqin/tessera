"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntegrationStore } from "@tessera/integration-store";
import { computeMetrics, filterToolCalls, isErrorCall } from "../services/metrics";
import type { DashboardState, ToolCall, ToolFilter } from "../types/dashboard";

/**
 * ViewModel — Zustand subscribe + cleanup (explicit subscribe, auto-unsubscribe).
 *
 * Đọc `lastToolCall` và `toolCallHistory` từ Integration Layer; tự render lại khi store đổi
 * (D3 §7). Không subscribe trực tiếp trong component body.
 *
 * Không persist lựa chọn/tìm kiếm: đây là state UI thuần, mất khi unmount là chấp nhận được.
 */
export interface DashboardViewModel extends DashboardState {
  select: (id: string) => void;
  setFilter: (filter: ToolFilter) => void;
  setQuery: (query: string) => void;
  clear: () => void;
}

interface StoreSnapshot {
  lastToolCall: ToolCall | null;
  history: ToolCall[];
}

function readSnapshot(): StoreSnapshot {
  const state = useIntegrationStore.getState();
  return {
    lastToolCall: state.lastToolCall as ToolCall | null,
    history: state.toolCallHistory as ToolCall[],
  };
}

export function useDashboardViewModel(): DashboardViewModel {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(readSnapshot);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ToolFilter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const unsubscribe = useIntegrationStore.subscribe((state) => {
      setSnapshot({
        lastToolCall: state.lastToolCall as ToolCall | null,
        history: state.toolCallHistory as ToolCall[],
      });
    });
    return unsubscribe;
  }, []);

  // Test/standalone có thể chỉ set lastToolCall — coi như lịch sử 1 phần tử.
  const history = useMemo(() => {
    if (snapshot.history.length > 0) return snapshot.history;
    return snapshot.lastToolCall ? [snapshot.lastToolCall] : [];
  }, [snapshot]);

  const visible = useMemo(() => filterToolCalls(history, filter, query), [history, filter, query]);

  const selected = useMemo(() => {
    if (selectedId) {
      const found = history.find((call) => call.id === selectedId);
      if (found) return found;
    }
    return snapshot.lastToolCall ?? history.at(-1) ?? null;
  }, [history, selectedId, snapshot.lastToolCall]);

  const metrics = useMemo(() => computeMetrics(history), [history]);

  const select = useCallback((id: string) => setSelectedId(id), []);
  const clear = useCallback(() => {
    useIntegrationStore.getState().clearToolCallHistory();
    setSelectedId(null);
  }, []);

  return {
    lastToolCall: snapshot.lastToolCall,
    history,
    visible,
    selected,
    metrics,
    filter,
    query,
    isProcessing: selected?.result === undefined,
    errorMessage:
      selected && isErrorCall(selected)
        ? selected.result instanceof Error
          ? selected.result.message
          : "Tool trả về lỗi."
        : null,
    select,
    setFilter,
    setQuery,
    clear,
  };
}
