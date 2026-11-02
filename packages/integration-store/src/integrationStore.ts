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
 * Shell và các remote Module Federation dùng chung 1 instance store (khai báo `shared` singleton
 * trong next.config.js của từng app). Persist qua localStorage để giữ `lastToolCall`/`navState`
 * khi tải lại trang và khi một remote chạy độc lập (giữ từ giai đoạn Multi-Zones, khi mỗi zone là
 * một runtime JS riêng nên bắt buộc — docs/findings/R2-module-federation-nextjs-approuter.md §10).
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
