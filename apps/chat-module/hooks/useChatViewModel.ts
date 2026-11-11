"use client";

import { useCallback, useState } from "react";
import { useIntegrationStore } from "@tessera/integration-store";
import { sendPrompt } from "../services/chatService";
import type { Message } from "../types/chat";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Thêm message mới hoặc ghi đè message cùng id (message agent được cập nhật dần khi streaming). */
function upsertMessage(messages: Message[], next: Message): Message[] {
  return messages.some((m) => m.id === next.id)
    ? messages.map((m) => (m.id === next.id ? next : m))
    : [...messages, next];
}

export interface ChatViewModel {
  messages: Message[];
  isSending: boolean;
  submitPrompt: (promptText: string) => Promise<void>;
}

export function useChatViewModel(): ChatViewModel {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const setLastToolCall = useIntegrationStore((state) => state.setLastToolCall);

  const submitPrompt = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);

      const agentId = createId();
      let streamed = "";

      try {
        const { message, toolCall } = await sendPrompt(trimmed, {
          onDelta: (delta) => {
            streamed += delta;
            const partial: Message = {
              id: agentId,
              role: "agent",
              content: streamed,
              status: "sent",
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => upsertMessage(prev, partial));
          },
        });
        setMessages((prev) => upsertMessage(prev, { ...message, id: agentId }));
        if (toolCall) {
          setLastToolCall(toolCall);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "agent",
            content: "Không nhận được phản hồi, thử lại.",
            status: "error",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [setLastToolCall],
  );

  return { messages, isSending, submitPrompt };
}
