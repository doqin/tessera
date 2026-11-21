"use client";

import { Icon, useT } from "@tessera/shared-ui";

/**
 * Fallback khi remote Module Federation không nạp được (spec 001 FR5/AC5).
 * Header/sidebar của Shell vẫn hoạt động; nút "Tải lại trang" tải lại vì next/dynamic ghi nhớ
 * kết quả nạp lỗi trong phiên (reset boundary là không đủ).
 */
export function RemoteErrorFallback({
  moduleName,
  message,
}: {
  moduleName: string;
  message: string;
}) {
  const t = useT();

  return (
    <div className="ts-card" role="alert" style={{ padding: "var(--dq-space-6)" }}>
      <div className="ts-empty" style={{ padding: 0, alignItems: "flex-start", textAlign: "left" }}>
        <div className="ts-empty__icon" style={{ color: "var(--dq-color-danger)" }}>
          <Icon name="info" size={22} />
        </div>
        <p className="ts-empty__title">{t("error.moduleTitle", { module: moduleName })}</p>
        <p className="ts-empty__sub">{t("error.hint")}</p>
        <p className="ts-mono" style={{ color: "var(--dq-color-danger)" }}>
          {message}
        </p>
        <button
          type="button"
          className="dq-btn dq-btn--primary"
          onClick={() => window.location.reload()}
        >
          <Icon name="refresh" size={14} />
          {t("common.retry")}
        </button>
      </div>
    </div>
  );
}
