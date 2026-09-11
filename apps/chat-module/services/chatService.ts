import type { ToolCall } from "@tessera/integration-store";
import type { Message } from "../types/chat";

export interface ChatServiceResponse {
  message: Message;
  toolCall?: ToolCall;
}

const MOCK_REPLY_PREFIX =
  "Đây là phản hồi mẫu (mock) — giai đoạn nền tảng chưa nối Groq API thật (xem specs/002-chat-module/tasks.md T011).";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Mock cố định (không gọi LLM API thật) — chứng minh luồng ViewModel → View và
 * lastToolCall → Integration Layer hoạt động end-to-end trước khi nối Groq API thật.
 */
export async function sendPrompt(promptText: string): Promise<ChatServiceResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const toolCall: ToolCall = {
    id: createId(),
    name: "mock_search",
    params: { query: promptText },
    result: { hits: 0 },
    calledAt: now,
  };

  return {
    message: {
      id: createId(),
      role: "agent",
      content: `${MOCK_REPLY_PREFIX} (prompt nhận được: "${promptText}")`,
      status: "sent",
      createdAt: now,
    },
    toolCall,
  };
}
