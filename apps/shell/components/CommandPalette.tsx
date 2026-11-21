"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Icon, type IconName, useT, type TranslationKey } from "@tessera/shared-ui";

export interface PaletteCommand {
  id: string;
  label: string;
  group: TranslationKey;
  icon: IconName;
  /** Chạy lệnh; palette tự đóng sau khi chạy. */
  run: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: PaletteCommand[];
}

/**
 * Bảng lệnh (Ctrl/Cmd+K) — điều hướng + thao tác hệ thống bằng bàn phím.
 * Không dùng thư viện ngoài (constitution §4): tự xử lý filter, ArrowUp/Down, Enter, Escape.
 */
export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) => command.label.toLowerCase().includes(needle));
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const groups = filtered.reduce<{ key: TranslationKey; items: PaletteCommand[] }[]>(
    (acc, command) => {
      const existing = acc.find((group) => group.key === command.group);
      if (existing) existing.items.push(command);
      else acc.push({ key: command.group, items: [command] });
      return acc;
    },
    [],
  );

  const flat = groups.flatMap((group) => group.items);
  const activeId = flat[activeIndex]?.id;

  function run(command: PaletteCommand | undefined) {
    if (!command) return;
    onClose();
    command.run();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (flat.length === 0 ? 0 : (index + 1) % flat.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (flat.length === 0 ? 0 : (index - 1 + flat.length) % flat.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run(flat[activeIndex]);
    }
  }

  return (
    <div
      className="ts-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="ts-palette"
        role="dialog"
        aria-modal="true"
        aria-label={t("palette.title")}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          className="ts-palette__input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("palette.placeholder")}
          aria-label={t("palette.title")}
        />
        <div className="ts-palette__list">
          {filtered.length === 0 ? (
            <p className="ts-palette__empty">{t("palette.empty")}</p>
          ) : (
            groups.map((group) => (
              <div key={group.key}>
                <p className="ts-palette__group">{t(group.key)}</p>
                {group.items.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    className="ts-palette__item"
                    data-active={command.id === activeId ? "true" : undefined}
                    onMouseEnter={() =>
                      setActiveIndex(flat.findIndex((item) => item.id === command.id))
                    }
                    onClick={() => run(command)}
                  >
                    <Icon name={command.icon} size={16} />
                    {command.label}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
