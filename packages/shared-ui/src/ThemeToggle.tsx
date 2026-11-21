"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useT } from "./i18n";
import { applyTheme, currentTheme, type Theme } from "./theme";

/**
 * Nút chuyển sáng/tối ở header. Trạng thái khởi tạo là "light" (khớp HTML render từ server),
 * sau khi mount mới đọc lựa chọn đã lưu — tránh hydration mismatch.
 */
export function ThemeToggle() {
  const t = useT();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(currentTheme());
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = next === "dark" ? t("theme.toDark") : t("theme.toLight");

  return (
    <button
      type="button"
      className="ts-icon-btn"
      aria-label={label}
      title={label}
      onClick={() => setTheme(applyTheme(next))}
    >
      <Icon name={next === "dark" ? "moon" : "sun"} size={17} />
    </button>
  );
}
