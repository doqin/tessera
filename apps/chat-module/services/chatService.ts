import type { ToolCall } from "@tessera/integration-store";
import type { Message } from "../types/chat";

export interface ChatServiceResponse {
  message: Message;
  toolCall?: ToolCall;
}

export interface SendPromptOptions {
  /** Gọi mỗi khi nhận thêm một đoạn nội dung (streaming). */
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
}

// Remote chạy trong trình duyệt của Shell nên URL phải tuyệt đối tới origin của chat-module
// (route handler `app/api/chat/route.ts` giữ GROQ_API_KEY phía server). Đặt khi build/deploy.
const CHAT_API_URL = `${process.env.NEXT_PUBLIC_CHAT_API_URL ?? "http://localhost:3001"}/api/chat`;

/** Timeout 15s (spec Clarify §9): áp dụng cho lúc chờ phản hồi đầu tiên và cho mỗi khoảng lặng giữa 2 chunk. */
export const STREAM_TIMEOUT_MS = 15_000;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Phân tích 1 dòng SSE: `[DONE]` là tín hiệu kết thúc hợp lệ của stream. */
function isDoneLine(line: string): boolean {
  return line.startsWith("data:") && line.slice(5).trim() === "[DONE]";
}

/** Lấy phần nội dung tăng dần từ một dòng SSE `data: {...}` của Groq (OpenAI shape). */
function parseSseLine(line: string): string {
  if (!line.startsWith("data:")) return "";
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  try {
    const json = JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[] };
    return json.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}

/**
 * Gửi prompt tới `/api/chat` và đọc phản hồi streaming (SSE). Trả về message hoàn chỉnh khi
 * stream kết thúc; `onDelta` được gọi theo từng chunk để View cập nhật dần (FR3, AC2).
 *
 * Reject khi: HTTP lỗi, quá 15s không có dữ liệu (timeout), mất kết nối giữa chừng, hoặc stream
 * đóng mà không có `[DONE]` (bị cắt ngang). Phần nội dung đã nhận vẫn đã được đẩy qua `onDelta`
 * nên ViewModel giữ được partial content (T015).
 */
export async function sendPrompt(
  promptText: string,
  { onDelta, signal }: SendPromptOptions = {},
): Promise<ChatServiceResponse> {
  const controller = new AbortController();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", () => controller.abort(), { once: true });

  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const armTimeout = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, STREAM_TIMEOUT_MS);
  };

  let content = "";
  let finished = false;
  const consume = (rawLine: string) => {
    const line = rawLine.trim();
    if (isDoneLine(line)) finished = true;
    const delta = parseSseLine(line);
    if (!delta) return;
    content += delta;
    onDelta?.(delta);
  };

  try {
    armTimeout();
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: promptText }),
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      throw new Error(`Chat API lỗi (${response.status}).`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      armTimeout();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(consume);
    }
    consume(buffer + decoder.decode());
  } catch (error) {
    if (timedOut) throw new Error(`Chat API không phản hồi sau ${STREAM_TIMEOUT_MS / 1000}s.`);
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!finished) throw new Error("Phản hồi bị ngắt giữa chừng.");

  const now = new Date().toISOString();
  // Tạm thời vẫn dùng toolCall mẫu để luồng Chat → Dashboard chạy được; T016 thay bằng detection thật.
  const toolCall: ToolCall = {
    id: createId(),
    name: "mock_search",
    params: { query: promptText },
    result: { hits: 0 },
    calledAt: now,
  };

  return {
    message: { id: createId(), role: "agent", content, status: "sent", createdAt: now },
    toolCall,
  };
}
