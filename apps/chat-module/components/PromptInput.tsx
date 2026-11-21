"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Icon, useT } from "@tessera/shared-ui";

export const MAX_PROMPT_LENGTH = 4000;

export interface PromptInputProps {
  onSubmit: (value: string) => void;
  /** Hiện nút Dừng khi agent đang trả lời (specs/004 — huỷ stream). */
  onStop?: () => void;
  isSending?: boolean;
  maxLength?: number;
  placeholder?: string;
}

/**
 * Ô nhập prompt: textarea tự giãn, Enter để gửi, Shift+Enter xuống dòng, nút Dừng khi đang stream.
 * Không khoá input khi đang chờ (Clarify 002 §9 — cho phép gửi tiếp, FIFO).
 */
export function PromptInput({
  onSubmit,
  onStop,
  isSending = false,
  maxLength = MAX_PROMPT_LENGTH,
  placeholder,
}: PromptInputProps) {
  const t = useT();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    if (node.scrollHeight > 0) node.style.height = `${Math.min(node.scrollHeight, 180)}px`;
  }, []);

  useEffect(resize, [value, resize]);

  function submit() {
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="ts-composer">
        <textarea
          ref={textareaRef}
          className="ts-composer__input"
          rows={1}
          value={value}
          maxLength={maxLength}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t("chat.placeholder")}
          aria-label="Prompt"
        />
        {isSending && onStop ? (
          <button
            type="button"
            className="ts-send ts-send--stop"
            onClick={onStop}
            aria-label={t("chat.stop")}
            title={t("chat.stop")}
          >
            <Icon name="stop" size={16} />
          </button>
        ) : (
          <button
            type="submit"
            className="ts-send"
            disabled={!value.trim()}
            aria-label={t("chat.send")}
            title={t("chat.send")}
          >
            <Icon name="send" size={17} />
          </button>
        )}
      </div>
      <div className="ts-composer__hint">
        <Icon name="info" size={12} />
        <span>{t("chat.enterHint")}</span>
        <span className="ts-spacer" />
        <span className="ts-mono">{t("chat.chars", { count: value.length, max: maxLength })}</span>
      </div>
    </form>
  );
}
