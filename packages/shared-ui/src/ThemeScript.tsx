import { THEME_BOOT_SCRIPT } from "./theme";

/**
 * Nhúng script đặt theme trước khi hydrate (chống nháy trắng với dark mode).
 * Đặt trong <head> của root layout.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />;
}
