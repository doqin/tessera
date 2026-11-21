"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIntegrationStore } from "@tessera/integration-store";
import { sendPrompt } from "../services/chatService";
import type { Message } from "../types/chat";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
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
  /** Message agent đang được stream (để View hiện con trỏ + ẩn nút Tạo lại). */
  streamingId: string | null;
  submitPrompt: (promptText: string) => Promise<void>;
  /** Huỷ lượt stream đang chạy; phần đã nhận được giữ lại với trạng thái `interrupted`. */
  stop: () => void;
  /** Chạy lại prompt đứng trước message agent được chỉ định. */
  regenerate: (messageId: string) => void;
  /** Gửi lại prompt của message lỗi. */
  retry: (messageId: string) => void;
  /** Bắt đầu cuộc trò chuyện mới (xoá transcript, huỷ stream đang chạy). */
  clearConversation: () => void;
}

/** Nội dung prompt người dùng đứng ngay trước message có id cho trước. */
function promptBefore(messages: Message[], messageId: string): string | null {
  const index = messages.findIndex((message) => message.id === messageId);
  if (index < 0) return null;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const candidate = messages[cursor];
    if (candidate?.role === "user") return candidate.content;
  }
  return null;
}

export function useChatViewModel(): ChatViewModel {
  // Transcript được khôi phục từ Integration Layer: remote bị unmount khi điều hướng sang route
  // khác, nên state cục bộ sẽ mất nếu không giữ ở store dùng chung (specs/002 §9).
  const [messages, setMessages] = useState<Message[]>(
    () => useIntegrationStore.getState().chatTranscript,
  );
  const [isSending, setIsSending] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const setLastToolCall = useIntegrationStore((state) => state.setLastToolCall);
  const setChatTranscript = useIntegrationStore((state) => state.setChatTranscript);
  const clearChatTranscript = useIntegrationStore((state) => state.clearChatTranscript);
  const abortRef = useRef<AbortController | null>(null);
  const pendingRef = useRef(0);
  const latestMessages = useRef(messages);
  latestMessages.current = messages;

  // Ghi transcript sau khi stream lắng (debounce) — không persist ở mỗi token.
  useEffect(() => {
    const timer = setTimeout(() => setChatTranscript(latestMessages.current), 300);
    return () => clearTimeout(timer);
  }, [messages, setChatTranscript]);

  // Unmount khi timer chưa chạy (điều hướng ngay sau khi trả lời) → ghi nốt.
  useEffect(
    () => () => {
      setChatTranscript(latestMessages.current);
    },
    [setChatTranscript],
  );

  const runPrompt = useCallback(
    async (promptText: string, appendUser: boolean) => {
      const trimmed = promptText.trim();
      if (!trimmed) return;

      const userMessage: Message = {
        id: createId(),
        role: "user",
        content: trimmed,
        status: "sent",
        createdAt: new Date().toISOString(),
      };
      if (appendUser) setMessages((prev) => [...prev, userMessage]);

      const agentId = createId();
      const startedAt = now();
      const controller = new AbortController();
      abortRef.current = controller;
      pendingRef.current += 1;
      setIsSending(true);
      setStreamingId(agentId);

      let streamed = "";

      try {
        const { message, toolCall } = await sendPrompt(trimmed, {
          signal: controller.signal,
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

        const durationMs = Math.round(now() - startedAt);
        setMessages((prev) =>
          upsertMessage(prev, {
            ...message,
            id: agentId,
            toolName: toolCall?.name,
            durationMs,
            toolResult: toolCall?.result,
            toolStatus: toolCall ? "success" : undefined,
          }),
        );
        if (toolCall) {
          setLastToolCall({
            ...toolCall,
            durationMs,
            status: toolCall.result instanceof Error ? "error" : "success",
          });
        }
      } catch (error) {
        const durationMs = Math.round(now() - startedAt);

        if (controller.signal.aborted) {
          // Người dùng bấm Dừng: giữ phần đã stream, đánh dấu bị ngắt (Clarify 002 §9).
          if (streamed) {
            setMessages((prev) =>
              upsertMessage(prev, {
                id: agentId,
                role: "agent",
                content: streamed,
                status: "interrupted",
                createdAt: new Date().toISOString(),
                durationMs,
              }),
            );
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "agent",
              content: error instanceof Error ? error.message : "",
              status: "error",
              createdAt: new Date().toISOString(),
              durationMs,
            },
          ]);
        }
      } finally {
        pendingRef.current = Math.max(0, pendingRef.current - 1);
        if (pendingRef.current === 0) {
          setStreamingId(null);
          setIsSending(false);
          abortRef.current = null;
        }
      }
    },
    [setLastToolCall],
  );

  const submitPrompt = useCallback(
    async (promptText: string) => {
      await runPrompt(promptText, true);
    },
    [runPrompt],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(
    (messageId: string) => {
      const prompt = promptBefore(messages, messageId);
      if (!prompt) return;
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
      void runPrompt(prompt, false);
    },
    [messages, runPrompt],
  );

  const retry = useCallback(
    (messageId: string) => {
      const prompt = promptBefore(messages, messageId);
      if (!prompt) return;
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
      void runPrompt(prompt, false);
    },
    [messages, runPrompt],
  );

  const clearConversation = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingId(null);
    clearChatTranscript();
  }, [clearChatTranscript]);

  return {
    messages,
    isSending,
    streamingId,
    submitPrompt,
    stop,
    regenerate,
    retry,
    clearConversation,
  };
}
