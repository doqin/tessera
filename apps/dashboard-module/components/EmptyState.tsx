"use client";

import { Icon, useT } from "@tessera/shared-ui";

/**
 * EmptyState — placeholder khi chưa có tool call nào từ Agent.
 * Giữ nguyên câu "Chưa có tool nào được gọi" (spec 003 AC1, e2e) và thêm hướng dẫn + CTA.
 */
export default function EmptyState({ message }: { message?: string }) {
  const t = useT();

  return (
    <div className="ts-empty" style={{ flex: 1 }}>
      <div className="ts-empty__icon" aria-hidden="true">
        <Icon name="activity" size={24} />
      </div>
      <p className="ts-empty__title">{message ?? t("dash.empty.title")}</p>
      <p className="ts-empty__sub">{t("dash.empty.sub")}</p>
      <a className="dq-btn dq-btn--secondary" href="/chat" style={{ textDecoration: "none" }}>
        <Icon name="chat" size={15} />
        {t("dash.empty.cta")}
      </a>
    </div>
  );
}
