import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { NavState, ToolCall } from "./types";

export interface IntegrationState {
  sessionId: string;
  lastToolCall: ToolCall | null;
  navState: NavState;
  setLastToolCall: (call: ToolCall) => void;
  setNavState: (route: string) => void;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Persist qua localStorage — bắt buộc sau khi pivot sang Next.js Multi-Zones
 * (docs/findings/R2-module-federation-nextjs-approuter.md §10): mỗi lần điều hướng băng qua zone
 * là một lần nạp lại toàn bộ runtime JS (store in-memory bị reset), nhưng localStorage vẫn dùng
 * chung vì các zone cùng origin trình duyệt. Zone tải sau HYDRATE được `lastToolCall`/`navState`
 * gần nhất lúc mount — không còn live-reactive trong khi đang mounted như thiết kế MF ban đầu.
 * `noopStorage` tránh truy cập `localStorage` lúc render phía server (không tồn tại ở Node).
 */
export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      sessionId: createSessionId(),
      lastToolCall: null,
      navState: { currentRoute: "/" },
      setLastToolCall: (call) => set({ lastToolCall: call }),
      setNavState: (route) => set({ navState: { currentRoute: route } }),
    }),
    {
      name: "tessera-integration-store",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (state) => ({
        sessionId: state.sessionId,
        lastToolCall: state.lastToolCall,
        navState: state.navState,
      }),
    },
  ),
);
