import type { ToolCall } from "@tessera/integration-store";
import type { Message } from "../types/chat";
import { executeTool } from "./tools";

export interface ChatServiceResponse {
  message: Message;
  toolCall?: ToolCall;
}

export interface SendPromptOptions {
  /** Gọi mỗi khi nhận thêm một đoạn nội dung (streaming). */
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
  /** Thời gian chờ tối đa không có dữ liệu mới (ms). Mặc định 15s (Clarify §9). */
  timeoutMs?: number;
}

export const REQUEST_TIMEOUT_MS = 15_000;

/** Lỗi do hết thời gian chờ (không nhận được phản hồi/chunk mới trong `timeoutMs`). */
export class ChatTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Chat API không phản hồi sau ${timeoutMs / 1000}s.`);
    this.name = "ChatTimeoutError";
  }
}

// Remote chạy trong trình duyệt của Shell nên URL phải tuyệt đối tới origin của chat-module
// (route handler `app/api/chat/route.ts` giữ GROQ_API_KEY phía server). Đặt khi build/deploy.
const CHAT_API_URL = `${process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:3001"}/api/chat`;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface ToolCallDelta {
  index?: number;
  id?: string;
  function?: { name?: string; arguments?: string };
}

interface SseEvent {
  delta: string;
  toolCalls: ToolCallDelta[];
  /** Stream đã kết thúc đúng cách (`[DONE]` hoặc `finish_reason`). */
  finished: boolean;
}

/** Đọc một dòng SSE `data: {...}` của Groq (OpenAI shape). */
function parseSseLine(line: string): SseEvent {
  const none: SseEvent = { delta: "", toolCalls: [], finished: false };
  if (!line.startsWith("data:")) return none;
  const data = line.slice(5).trim();
  if (!data) return none;
  if (data === "[DONE]") return { ...none, finished: true };
  try {
    const json = JSON.parse(data) as {
      choices?: {
        delta?: { content?: string | null; tool_calls?: ToolCallDelta[] };
        finish_reason?: string | null;
      }[];
    };
    const choice = json.choices?.[0];
    return {
      delta: choice?.delta?.content ?? "",
      toolCalls: choice?.delta?.tool_calls ?? [],
      finished: Boolean(choice?.finish_reason),
    };
  } catch {
    return none;
  }
}

interface PendingToolCall {
  id?: string;
  name: string;
  args: string;
}

/** Gom các mảnh `delta.tool_calls` (theo `index`) thành tool-call hoàn chỉnh. */
function accumulateToolCalls(pending: Map<number, PendingToolCall>, deltas: ToolCallDelta[]) {
  deltas.forEach((delta, position) => {
    const index = delta.index ?? position;
    const entry = pending.get(index) ?? { name: "", args: "" };
    entry.id = delta.id ?? entry.id;
    entry.name += delta.function?.name ?? "";
    entry.args += delta.function?.arguments ?? "";
    pending.set(index, entry);
  });
}

/**
 * Chạy tool mẫu cho tool-call cuối hợp lệ (store chỉ lưu `lastToolCall`). Tool lạ hoặc
 * `arguments` không phải JSON object → bỏ qua (spec §9).
 */
function resolveToolCall(
  pending: Map<number, PendingToolCall>,
  calledAt: string,
): ToolCall | undefined {
  const entries = [...pending.entries()].sort(([a], [b]) => b - a).map(([, entry]) => entry);
  for (const entry of entries) {
    let params: unknown;
    try {
      params = JSON.parse(entry.args.trim() || "{}");
    } catch {
      continue;
    }
    if (typeof params !== "object" || params === null || Array.isArray(params)) continue;
    const executed = executeTool(entry.name, params as Record<string, unknown>);
    if (!executed) continue;
    return {
      id: entry.id ?? createId(),
      name: entry.name,
      params: params as Record<string, unknown>,
      result: executed.result,
      calledAt,
    };
  }
  return undefined;
}

/**
 * Gửi prompt tới `/api/chat` và đọc phản hồi streaming (SSE). Trả về message hoàn chỉnh khi
 * stream kết thúc; `onDelta` được gọi theo từng chunk để View cập nhật dần (FR3, AC2).
 *
 * Lỗi/timeout (Clarify §9): hết `timeoutMs` không có dữ liệu mới → `ChatTimeoutError`. Nếu lỗi
 * xảy ra khi chưa nhận được nội dung nào thì reject; nếu đã có partial content thì trả message
 * với `status: "interrupted"` thay vì mất nội dung đã stream.
 */
export async function sendPrompt(
  promptText: string,
  { onDelta, signal, timeoutMs = REQUEST_TIMEOUT_MS }: SendPromptOptions = {},
): Promise<ChatServiceResponse> {
  const controller = new AbortController();
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const armTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  };
  const onCallerAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", onCallerAbort);

  const toError = (error: unknown): Error =>
    timedOut
      ? new ChatTimeoutError(timeoutMs)
      : error instanceof Error
        ? error
        : new Error("Lỗi không xác định.");

  let content = "";
  let finished = false;
  const pendingToolCalls = new Map<number, PendingToolCall>();
  let failure: Error | undefined;

  try {
    armTimer();
    let response: Response;
    try {
      response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
        signal: controller.signal,
      });
    } catch (error) {
      throw toError(error);
    }
    if (!response.ok || !response.body) {
      throw new Error(`Chat API lỗi (${response.status}).`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const consume = (line: string) => {
      const event = parseSseLine(line.trim());
      if (event.finished) finished = true;
      accumulateToolCalls(pendingToolCalls, event.toolCalls);
      if (!event.delta) return;
      content += event.delta;
      onDelta?.(event.delta);
    };

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        armTimer();
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(consume);
      }
      consume(buffer + decoder.decode());
    } catch (error) {
      failure = toError(error);
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onCallerAbort);
  }

  // Người gọi chủ động huỷ: không coi là "bị ngắt", để họ tự xử lý.
  if (signal?.aborted) throw failure ?? new Error("Đã huỷ.");

  const interrupted = Boolean(failure) || !finished;
  if (interrupted && !content) {
    throw failure ?? new Error("Chat API đóng kết nối mà không trả nội dung.");
  }

  const now = new Date().toISOString();
  const toolCall = interrupted ? undefined : resolveToolCall(pendingToolCalls, now);
  // Model chỉ gọi tool mà không trả text: tránh bong bóng chat rỗng.
  const text = content || (toolCall ? `Đã gọi tool ${toolCall.name}.` : "");

  return {
    message: {
      id: createId(),
      role: "agent",
      content: text,
      status: interrupted ? "interrupted" : "sent",
      createdAt: now,
    },
    toolCall,
  };
}
