"use client";

import { Badge, Icon, useCopy, useLocale, useT } from "@tessera/shared-ui";
import type { Message } from "../types/chat";
import { MarkdownText } from "./MarkdownText";
import { ToolResultCard } from "./ToolResultCard";

export interface MessageBubbleProps {
  message: Message;
  /** Đang stream message này → hiện con trỏ nhấp nháy + ẩn nút Tạo lại. */
  isStreaming?: boolean;
  onRegenerate?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
}

function timeLabel(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
  onRetry,
}: MessageBubbleProps) {
  const t = useT();
  const locale = useLocale();
  const { copied, copy } = useCopy();
  const isUser = message.role === "user";
  const isError = message.status === "error";

  const classes = [
    "ts-msg",
    isUser ? "ts-msg--user" : "ts-msg--agent",
    isError ? "ts-msg--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} data-role={message.role}>
      <div className={isUser ? "ts-avatar" : "ts-avatar ts-avatar--agent"} aria-hidden="true">
        {isUser ? "U" : <Icon name="spark" size={16} />}
      </div>

      <div className="ts-msg__body">
        <div className="ts-msg__meta">
          <span style={{ fontWeight: 600 }}>{isUser ? t("chat.you") : t("chat.agent")}</span>
          {message.createdAt ? <span>{timeLabel(message.createdAt, locale)}</span> : null}
          {message.toolName ? (
            <Badge tone="primary">
              <Icon name="bolt" size={11} />
              {message.toolName}
            </Badge>
          ) : null}
          {typeof message.durationMs === "number" ? <span>{message.durationMs} ms</span> : null}
        </div>

        <div className="ts-bubble">
          {isUser ? (
            <p style={{ whiteSpace: "pre-wrap" }}>{message.content}</p>
          ) : (
            <span className={isStreaming ? "ts-cursor" : undefined}>
              <MarkdownText text={message.content} />
            </span>
          )}
        </div>

        {!isUser && message.toolResult !== undefined ? (
          <ToolResultCard
            name={message.toolName ?? "tool"}
            result={message.toolResult}
            durationMs={message.durationMs}
            status={message.toolStatus ?? "success"}
          />
        ) : null}

        {isError ? (
          <p style={{ color: "var(--dq-color-danger)", fontSize: "var(--dq-text-sm)" }}>
            {t("chat.errorHint")}
          </p>
        ) : null}
        {message.status === "interrupted" ? (
          <p style={{ color: "var(--dq-color-warning)", fontSize: "var(--dq-text-sm)" }}>
            {t("chat.interruptedHint")}
          </p>
        ) : null}

        <div className="ts-msg__actions">
          <button
            type="button"
            className="ts-mini-btn"
            onClick={() => void copy(message.content)}
            aria-label={`${t("chat.copy")} — ${isUser ? t("chat.you") : t("chat.agent")}`}
          >
            <Icon name={copied ? "check" : "copy"} size={13} />
            {copied ? t("chat.copied") : t("chat.copy")}
          </button>
          {!isUser && !isStreaming && onRegenerate ? (
            <button type="button" className="ts-mini-btn" onClick={() => onRegenerate(message.id)}>
              <Icon name="refresh" size={13} />
              {t("chat.regenerate")}
            </button>
          ) : null}
          {isError && onRetry ? (
            <button type="button" className="ts-mini-btn" onClick={() => onRetry(message.id)}>
              <Icon name="refresh" size={13} />
              {t("chat.retry")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
