"use client";

import { useIntegrationStore, type Locale } from "@tessera/integration-store";
import { useT } from "./i18n";

const OPTIONS: Locale[] = ["vi", "en"];

/**
 * Chuyển ngôn ngữ VI/EN. Ghi vào Integration Layer nên mọi remote đang mount đổi ngay lập tức
 * (store là singleton chia sẻ qua Module Federation).
 */
export function LocaleToggle() {
  const t = useT();
  const locale = useIntegrationStore((state) => state.locale);
  const setLocale = useIntegrationStore((state) => state.setLocale);

  return (
    <div className="ts-seg" role="group" aria-label={t("lang.label")}>
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className="ts-seg__btn"
          aria-pressed={locale === option}
          onClick={() => setLocale(option)}
        >
          {t(option === "vi" ? "lang.vi" : "lang.en")}
        </button>
      ))}
    </div>
  );
}
