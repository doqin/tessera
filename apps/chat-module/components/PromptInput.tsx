"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@tessera/shared-ui";

export interface PromptInputProps {
  onSubmit: (value: string) => void;
}

export function PromptInput({ onSubmit }: PromptInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="dq-row"
      style={{
        gap: "var(--dq-space-2)",
        padding: "var(--dq-space-2)",
        borderTop: "2px solid var(--dq-color-border)",
      }}
    >
      <input
        className="dq-input"
        style={{ flex: 1 }}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Nhập prompt..."
        aria-label="Prompt"
      />
      <Button type="submit" disabled={!value.trim()}>
        Gửi
      </Button>
    </form>
  );
}
