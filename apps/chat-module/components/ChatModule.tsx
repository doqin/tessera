"use client";

import { Badge, Icon, useLocale, useT } from "@tessera/shared-ui";
import { downloadTranscript, transcriptToMarkdown } from "../services/exportTranscript";
import { useChatViewModel } from "../hooks/useChatViewModel";
import { ChatWindow } from "./ChatWindow";
import { PromptInput } from "./PromptInput";

/** Model hiển thị trên header — chỉ là nhãn, request thật do `/api/chat` quyết định. */
const MODEL_LABEL = process.env.NEXT_PUBLIC_GROQ_MODEL ?? "qwen3.8-27b";

/**
 * Entry point expose qua Module Federation (`chat_module/ChatModule`) — Shell mount component
 * này vào vùng nội dung route `/chat` (specs/001-shell-app/plan.md §4).
 */
export default function ChatModule() {
  const t = useT();
  const locale = useLocale();
  const {
    messages,
    isSending,
    streamingId,
    submitPrompt,
    stop,
    regenerate,
    retry,
    clearConversation,
  } = useChatViewModel();

  return (
    <section className="ts-chat" aria-label={t("chat.title")}>
      <header className="ts-chat__head">
        <div className="ts-avatar ts-avatar--agent" aria-hidden="true">
          <Icon name="spark" size={16} />
        </div>
        <div className="ts-chat__title">
          <strong>{t("chat.title")}</strong>
          <span>{t("chat.subtitle")}</span>
        </div>
        <div className="ts-chat__actions">
          {messages.length > 0 ? (
            <button
              type="button"
              className="ts-mini-btn"
              onClick={() => {
                const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
                downloadTranscript(
                  `tessera-transcript-${stamp}.md`,
                  transcriptToMarkdown(messages, { locale }),
                );
              }}
              aria-label={`${t("chat.export")} — ${t("chat.exportHint")}`}
              title={t("chat.exportHint")}
            >
              <Icon name="download" size={13} />
              <span className="ts-chat__action-label">{t("chat.export")}</span>
            </button>
          ) : null}
          {messages.length > 0 ? (
            <button
              type="button"
              className="ts-mini-btn"
              onClick={clearConversation}
              aria-label={t("chat.new")}
              title={t("chat.new")}
            >
              <Icon name="refresh" size={13} />
              <span className="ts-chat__action-label">{t("chat.new")}</span>
            </button>
          ) : null}
          <Badge tone="primary">
            <Icon name="bolt" size={11} />
            {MODEL_LABEL}
          </Badge>
        </div>
      </header>

      <ChatWindow
        messages={messages}
        streamingId={streamingId}
        onRegenerate={regenerate}
        onRetry={retry}
        onSuggestion={(prompt) => void submitPrompt(prompt)}
      />

      <div className="ts-chat__foot">
        <PromptInput
          onSubmit={(value) => void submitPrompt(value)}
          onStop={stop}
          isSending={isSending}
        />
      </div>
    </section>
  );
}
