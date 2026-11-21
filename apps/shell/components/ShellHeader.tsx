"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIntegrationStore } from "@tessera/integration-store";
import { Icon, toggleTheme, useSidebarState, useT } from "@tessera/shared-ui";
import { CommandPalette, type PaletteCommand } from "./CommandPalette";

/**
 * Top bar: one centred search field (opened as the command palette) and a single settings entry.
 * Language and theme live on /settings — a top bar is not a settings drawer.
 */
export function ShellHeader() {
  const t = useT();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const { mobileOpen, toggleMobile } = useSidebarState();
  const setLocale = useIntegrationStore((state) => state.setLocale);
  const clearHistory = useIntegrationStore((state) => state.clearToolCallHistory);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Nhãn phím tắt tính sau khi mount để HTML server/client không lệch nhau.
  useEffect(() => {
    if (typeof navigator !== "undefined" && /Mac/i.test(navigator.platform)) {
      setShortcut("⌘K");
    }
  }, []);

  // Cmd/Ctrl+K mở bảng lệnh (004 — keyboard-first shell).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commands: PaletteCommand[] = [
    {
      id: "nav-chat",
      group: "palette.navigate",
      label: t("nav.chat"),
      icon: "chat",
      run: () => router.push("/chat"),
    },
    {
      id: "nav-dashboard",
      group: "palette.navigate",
      label: t("nav.dashboard"),
      icon: "dashboard",
      run: () => router.push("/dashboard"),
    },
    {
      id: "nav-overview",
      group: "palette.navigate",
      label: t("nav.overview"),
      icon: "layers",
      run: () => router.push("/overview"),
    },
    {
      id: "nav-settings",
      group: "palette.navigate",
      label: t("settings.title"),
      icon: "settings",
      run: () => router.push("/settings"),
    },
    {
      id: "toggle-theme",
      group: "palette.actions",
      label: t("palette.action.theme"),
      icon: "moon",
      run: () => toggleTheme(),
    },
    {
      id: "clear-tools",
      group: "palette.actions",
      label: t("palette.action.clear"),
      icon: "trash",
      run: () => clearHistory(),
    },
    {
      id: "lang-vi",
      group: "palette.language",
      label: t("palette.action.langVi"),
      icon: "language",
      run: () => setLocale("vi"),
    },
    {
      id: "lang-en",
      group: "palette.language",
      label: t("palette.action.langEn"),
      icon: "language",
      run: () => setLocale("en"),
    },
  ];

  return (
    <>
      <header className="ts-header ts-topbar">
        <div className="ts-topbar__side">
          <button
            type="button"
            id="nav-toggle"
            className="ts-icon-btn ts-menu-btn"
            onClick={toggleMobile}
            aria-label={t("nav.menu")}
            aria-expanded={mobileOpen}
            aria-controls="app-nav"
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
        <button
          type="button"
          className="ts-search"
          onClick={openPalette}
          aria-label={t("palette.open")}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <Icon name="search" size={15} />
          <span className="ts-search__label">{t("palette.searchHint")}</span>
          <span className="ts-kbd">{shortcut}</span>
        </button>
        <div className="ts-topbar__side ts-topbar__side--end">
          <Link
            href="/settings"
            className="ts-icon-btn"
            aria-label={t("settings.title")}
            title={t("settings.title")}
          >
            <Icon name="settings" size={16} />
          </Link>
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
    </>
  );
}
