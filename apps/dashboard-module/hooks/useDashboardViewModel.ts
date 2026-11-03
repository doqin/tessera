"use client";

import { useEffect, useState } from "react";
import { useIntegrationStore, type ToolCall } from "@tessera/integration-store";

/**
 * ViewModel — Zustand subscribe + cleanup (Explicitly subscribe, auto-unsubscribe).
 *
 * Đồng bộ state sớm nhất khi mount, tự render lại khi `lastToolCall` thay đổi trong store
 * (Integration Layer / D3 §7). Không subscribe trực tiếp trong component body.
 */
export interface DashboardState {
  lastToolCall: ToolCall | null;
  isProcessing: boolean;
  errorMessage: string | null;
}

export function useDashboardViewModel(): DashboardState {
  const store = useIntegrationStore;
  const [state, setState] = useState<DashboardState>(() => {
    const initial = store.getState().lastToolCall;
    return {
      lastToolCall: initial,
      isProcessing: initial?.result === undefined,
      errorMessage: initial?.result instanceof Error ? (initial.result as Error).message : null,
    };
  });

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setState({
        lastToolCall: state.lastToolCall,
        isProcessing: state.lastToolCall?.result === undefined,
        errorMessage:
          state.lastToolCall?.result instanceof Error
            ? (state.lastToolCall.result as Error).message
            : null,
      });
    });
    return unsubscribe;
  }, [store]);

  return state;
}
