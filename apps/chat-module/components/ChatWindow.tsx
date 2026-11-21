"use client";

import { useEffect, useRef } from "react";
import { Icon, useT } from "@tessera/shared-ui";
import type { Message } from "../types/chat";
import { MessageBubble } from "./MessageBubble";

export interface ChatWindowProps {
  messages: Message[];
  /** Id của message agent đang stream (nếu có). */
  streamingId?: string | null;
  onRegenerate?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
  /** Bấm gợi ý ở trạng thái rỗng → gửi luôn prompt đó. */
  onSuggestion?: (prompt: string) => void;
}

export function ChatWindow({
  messages,
  streamingId = null,
  onRegenerate,
  onRetry,
  onSuggestion,
}: ChatWindowProps) {
  const t = useT();
  const endRef = useRef<HTMLDivElement>(null);
  const lastContent = messages.at(-1)?.content;

  // Tự cuộn xuống tin mới/đoạn stream mới nhất.
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end", behavior: "smooth" });
  }, [messages.length, streamingId, lastContent]);

  if (messages.length === 0) {
    const suggestions = [
      { title: t("chat.suggest1"), desc: t("chat.suggest1Desc") },
      { title: t("chat.suggest2"), desc: t("chat.suggest2Desc") },
      { title: t("chat.suggest3"), desc: t("chat.suggest3Desc") },
      { title: t("chat.suggest4"), desc: t("chat.suggest4Desc") },
    ];

    return (
      <div className="ts-chat__scroll" role="log" aria-live="polite">
        <div className="ts-empty">
          <div className="ts-empty__icon">
            <Icon name="spark" size={24} />
          </div>
          <p className="ts-empty__title">{t("chat.emptyTitle")}</p>
          <p className="ts-empty__sub">{t("chat.emptySub")}</p>
          <div className="ts-chips">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.title}
                type="button"
                className="ts-chip"
                onClick={() => onSuggestion?.(suggestion.title)}
              >
                {suggestion.title}
                <span>{suggestion.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ts-chat__scroll" role="log" aria-live="polite" aria-label={t("chat.title")}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingId}
          onRegenerate={onRegenerate}
          onRetry={onRetry}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
