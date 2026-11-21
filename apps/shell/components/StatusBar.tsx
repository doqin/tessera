"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useIntegrationStore } from "@tessera/integration-store";
import { useLocale, useT } from "@tessera/shared-ui";

/**
 * Thanh trạng thái dưới cùng của Shell — bằng chứng trực quan cho Integration Layer:
 * route hiện tại, phiên, số tool call và tool gần nhất được cập nhật live từ store dùng chung.
 */
export function StatusBar() {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const sessionId = useIntegrationStore((state) => state.sessionId);
  const toolCount = useIntegrationStore((state) => state.toolCallHistory.length);
  const lastToolName = useIntegrationStore((state) => state.lastToolCall?.name ?? null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <footer className="ts-statusbar" aria-label="Status">
      <span className="ts-statusbar__item">
        <span className={mounted ? "ts-dot" : "ts-dot ts-dot--idle"} aria-hidden="true" />
        {t("status.connection")}
      </span>
      <span className="ts-statusbar__item">
        {t("status.route")}: <span className="ts-mono">{pathname || "/"}</span>
      </span>
      <span className="ts-statusbar__item">
        {t("status.session")}:{" "}
        <span className="ts-mono">{mounted ? sessionId.slice(0, 8) : "—"}</span>
      </span>
      <span className="ts-statusbar__item" aria-live="polite" aria-atomic="true">
        {t("status.tools")}: <span className="ts-mono">{mounted ? toolCount : 0}</span>
      </span>
      <span className="ts-statusbar__item ts-statusbar__item--last">
        {t("status.lastTool")}:{" "}
        <span className="ts-mono">
          {mounted ? (lastToolName ?? t("status.none")) : t("status.none")}
        </span>
      </span>
      <span className="ts-statusbar__item ts-statusbar__item--right">
        {locale.toUpperCase()} · {t("status.stack")}
      </span>
    </footer>
  );
}
