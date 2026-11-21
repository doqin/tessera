import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { ChatMessage, Locale, NavState, ToolCall } from "./types";

/** Số tool call giữ lại trong phiên (timeline của Dashboard). */
export const TOOL_HISTORY_LIMIT = 50;

/** Số message giữ lại trong transcript (bảo vệ localStorage khỏi phình to). */
export const CHAT_TRANSCRIPT_LIMIT = 200;

export interface IntegrationState {
  sessionId: string;
  lastToolCall: ToolCall | null;
  /** Lịch sử tool call trong phiên hiện tại (mới nhất ở cuối mảng), tối đa TOOL_HISTORY_LIMIT. */
  toolCallHistory: ToolCall[];
  /** Transcript hội thoại trong phiên, tối đa CHAT_TRANSCRIPT_LIMIT message. */
  chatTranscript: ChatMessage[];
  navState: NavState;
  locale: Locale;
  setLastToolCall: (call: ToolCall) => void;
  appendToolCall: (call: ToolCall) => void;
  clearToolCallHistory: () => void;
  setChatTranscript: (messages: ChatMessage[]) => void;
  clearChatTranscript: () => void;
  setNavState: (route: string) => void;
  setLocale: (locale: Locale) => void;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Thêm vào cuối, bỏ qua id trùng và cắt bớt phần cũ nhất. */
function pushHistory(history: ToolCall[], call: ToolCall): ToolCall[] {
  const withoutDuplicate = history.filter((item) => item.id !== call.id);
  return [...withoutDuplicate, call].slice(-TOOL_HISTORY_LIMIT);
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

/**
 * Shell và các remote Module Federation dùng chung 1 instance store (khai báo `shared` singleton
 * trong next.config.js của từng app). Persist qua localStorage để giữ `lastToolCall`/lịch sử tool
 * khi tải lại trang và khi một remote chạy độc lập (giữ từ giai đoạn Multi-Zones, khi mỗi zone là
 * một runtime JS riêng nên bắt buộc — docs/findings/R2-module-federation-nextjs-approuter.md §10).
 * `noopStorage` tránh truy cập `localStorage` lúc render phía server (không tồn tại ở Node).
 *
 * `navState` cố tình **không** persist: nó là dẫn xuất của `usePathname()` và sẽ bị ghi đè bởi
 * giá trị cũ sau mỗi lần tải lại nếu lưu lại.
 */
export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      sessionId: createSessionId(),
      lastToolCall: null,
      toolCallHistory: [],
      chatTranscript: [],
      navState: { currentRoute: "/" },
      locale: "vi",
      setLastToolCall: (call) =>
        set((state) => ({
          lastToolCall: call,
          toolCallHistory: pushHistory(state.toolCallHistory, call),
        })),
      appendToolCall: (call) =>
        set((state) => ({
          lastToolCall: call,
          toolCallHistory: pushHistory(state.toolCallHistory, call),
        })),
      clearToolCallHistory: () => set({ lastToolCall: null, toolCallHistory: [] }),
      setChatTranscript: (messages) =>
        set({ chatTranscript: messages.slice(-CHAT_TRANSCRIPT_LIMIT) }),
      clearChatTranscript: () => set({ chatTranscript: [] }),
      setNavState: (route) => set({ navState: { currentRoute: route } }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "tessera-integration-store",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
      partialize: (state) => ({
        sessionId: state.sessionId,
        lastToolCall: state.lastToolCall,
        toolCallHistory: state.toolCallHistory,
        chatTranscript: state.chatTranscript,
        locale: state.locale,
      }),
    },
  ),
);
