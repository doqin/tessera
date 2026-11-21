"use client";

import { useEffect, useState } from "react";
import { useIntegrationStore } from "@tessera/integration-store";
import { applyTheme, currentTheme, useT, type Theme } from "@tessera/shared-ui";

/**
 * Settings: the only place that owns appearance and language. Keeping these two off the top bar
 * leaves the header with one job (search) and gives the options room to explain themselves.
 */
export default function SettingsPage() {
  const t = useT();
  const locale = useIntegrationStore((state) => state.locale);
  const setLocale = useIntegrationStore((state) => state.setLocale);
  const sessionId = useIntegrationStore((state) => state.sessionId);
  const toolCount = useIntegrationStore((state) => state.toolCallHistory.length);
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  const chooseTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <>
      <header className="ts-page__head ts-page__head--stack">
        <h1 className="ts-page__title">{t("settings.title")}</h1>
        <p className="ts-page__sub">{t("settings.sub")}</p>
      </header>

      <div className="ts-settings">
        <section className="ts-setting" aria-labelledby="setting-appearance">
          <div>
            <div className="ts-setting__label" id="setting-appearance">
              {t("settings.appearance")}
            </div>
            <p className="ts-setting__hint">{t("settings.appearanceHint")}</p>
          </div>
          <div className="ts-choice" role="group" aria-labelledby="setting-appearance">
            <button
              type="button"
              className="ts-choice__btn"
              aria-pressed={theme === "light"}
              onClick={() => chooseTheme("light")}
            >
              {t("settings.theme.light")}
            </button>
            <button
              type="button"
              className="ts-choice__btn"
              aria-pressed={theme === "dark"}
              onClick={() => chooseTheme("dark")}
            >
              {t("settings.theme.dark")}
            </button>
          </div>
        </section>

        <section className="ts-setting" aria-labelledby="setting-language">
          <div>
            <div className="ts-setting__label" id="setting-language">
              {t("settings.language")}
            </div>
            <p className="ts-setting__hint">{t("settings.languageHint")}</p>
          </div>
          <div className="ts-choice" role="group" aria-labelledby="setting-language">
            <button
              type="button"
              className="ts-choice__btn"
              aria-pressed={locale === "vi"}
              onClick={() => setLocale("vi")}
            >
              {t("lang.vi")}
            </button>
            <button
              type="button"
              className="ts-choice__btn"
              aria-pressed={locale === "en"}
              onClick={() => setLocale("en")}
            >
              {t("lang.en")}
            </button>
          </div>
        </section>

        <section className="ts-setting" aria-labelledby="setting-session">
          <div>
            <div className="ts-setting__label" id="setting-session">
              {t("settings.session")}
            </div>
            <p className="ts-setting__hint">{t("settings.sessionHint")}</p>
          </div>
          <dl className="ts-meta">
            <div className="ts-meta__row">
              <dt>{t("settings.sessionId")}</dt>
              <dd className="ts-mono">{mounted ? sessionId.slice(0, 8) : "—"}</dd>
            </div>
            <div className="ts-meta__row">
              <dt>{t("settings.toolCount")}</dt>
              <dd className="ts-mono">{mounted ? toolCount : 0}</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}
