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
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Nhập prompt..."
        aria-label="Prompt"
        className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={!value.trim()}>
        Gửi
      </Button>
    </form>
  );
}
