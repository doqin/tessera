export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "tessera-theme";

const DEFAULT_THEME: Theme = "light";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Đọc theme đã lưu; môi trường không có localStorage (SSR/test) thì trả mặc định. */
export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Theme đang áp lên <html data-theme>. */
export function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const applied = document.documentElement.dataset.theme;
  return isTheme(applied) ? applied : readStoredTheme();
}

/** Áp theme lên <html> và ghi nhớ lựa chọn. */
export function applyTheme(theme: Theme): Theme {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage bị chặn (private mode) — theme vẫn áp cho phiên hiện tại.
  }
  return theme;
}

export function toggleTheme(): Theme {
  return applyTheme(currentTheme() === "dark" ? "light" : "dark");
}

/**
 * Script chạy trước khi React hydrate để đặt `data-theme` sớm, tránh nháy trắng khi người dùng
 * chọn dark mode (FOUC). Nhúng bằng <ThemeScript /> trong layout.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
